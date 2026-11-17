import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { verifySync } from "otplib";
import type { SqlClient } from "../content-store.ts";
import { hashToken } from "./tokens.ts";

export class SecurityError extends Error {
  readonly code:
    | "INVALID_INPUT"
    | "INVALID_CREDENTIALS"
    | "MFA_REQUIRED"
    | "CONFLICT"
    | "NOT_CONFIGURED";
  constructor(code: SecurityError["code"], message: string) {
    super(message);
    this.name = "SecurityError";
    this.code = code;
  }
}

export function hasEncryptionKey(key?: string): boolean {
  return /^[a-f\d]{64}$/i.test(key ?? "");
}

function keyBytes(key?: string) {
  if (!hasEncryptionKey(key))
    throw new SecurityError(
      "NOT_CONFIGURED",
      "Authenticator setup is temporarily unavailable.",
    );
  return Buffer.from(key as string, "hex");
}

export function encryptSecret(
  secret: string,
  userId: string,
  key?: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(key), iv);
  cipher.setAAD(Buffer.from(userId));
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64url",
  );
}

export function decryptSecret(
  encrypted: string,
  userId: string,
  key?: string,
): string {
  const bytes = Buffer.from(encrypted, "base64url");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    keyBytes(key),
    bytes.subarray(0, 12),
  );
  cipher.setAAD(Buffer.from(userId));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([
    cipher.update(bytes.subarray(28)),
    cipher.final(),
  ]).toString("utf8");
}

export async function getMfa(client: SqlClient, userId: string) {
  const result = await client.execute({
    sql: "SELECT * FROM user_mfa WHERE user_id = ?",
    args: [userId],
  });
  return result.rows[0] ?? null;
}

export function totpCounter(
  secret: string,
  code: string,
  now: Date,
): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const result = verifySync({
    secret,
    token: code,
    epoch: now.getTime() / 1000,
    epochTolerance: 30,
  });
  return result.valid && "timeStep" in result ? result.timeStep : null;
}

/** Every factor is consumed in a conditional write, not a read-then-delete. */
export async function verifySecondFactor(
  client: SqlClient,
  userId: string,
  code: string | undefined,
  key: string | undefined,
  now: Date,
): Promise<{ required: boolean; valid: boolean; changeId: string }> {
  const mfa = await getMfa(client, userId);
  const changeId = mfa ? String(mfa.change_id) : "";
  if (!mfa?.enabled_at) return { required: false, valid: true, changeId };
  const cleaned = (code ?? "").trim().replace(/[\s-]/g, "");
  if (!cleaned) return { required: true, valid: false, changeId };
  if (/^[a-f\d]{32}$/i.test(cleaned)) {
    const result = await client.execute({
      sql: `DELETE FROM mfa_recovery_codes WHERE user_id = ? AND code_hash = ?
        AND EXISTS (SELECT 1 FROM user_mfa WHERE user_id = ? AND enabled_at IS NOT NULL AND change_id = ?) RETURNING code_hash`,
      args: [userId, hashToken(cleaned.toLowerCase()), userId, changeId],
    });
    return { required: true, valid: result.rows.length === 1, changeId };
  }
  const counter = totpCounter(
    decryptSecret(String(mfa.secret_encrypted), userId, key),
    cleaned,
    now,
  );
  if (counter === null) return { required: true, valid: false, changeId };
  const result = await client.execute({
    sql: "UPDATE user_mfa SET last_counter = ? WHERE user_id = ? AND enabled_at IS NOT NULL AND change_id = ? AND last_counter < ? RETURNING user_id",
    args: [counter, userId, changeId, counter],
  });
  return { required: true, valid: result.rows.length === 1, changeId };
}
