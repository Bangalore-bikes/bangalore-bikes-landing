import { randomBytes, randomUUID } from "node:crypto";
import { generateSecret, generateURI } from "otplib";
import type { SqlClient, SqlStatement } from "../content-store.ts";
import { findUserById } from "./repository.ts";
import { hashPassword, passwordProblem, verifyPassword } from "./password.ts";
import {
  decryptSecret,
  encryptSecret,
  getMfa,
  hasEncryptionKey,
  SecurityError,
  totpCounter,
  verifySecondFactor,
} from "./mfa.ts";
import { hashToken } from "./tokens.ts";

export function createSecurityService(options: {
  client: SqlClient;
  encryptionKey?: string;
  now?: () => Date;
}) {
  const { client } = options;
  const encryptionKey =
    options.encryptionKey ?? process.env.AUTH_ENCRYPTION_KEY;
  const now = options.now ?? (() => new Date());

  async function reauthenticate(userId: string, password: string) {
    const user = await findUserById(client, userId);
    if (
      !user ||
      user.disabledAt ||
      !user.emailVerifiedAt ||
      !(await verifyPassword(user.passwordHash, password))
    ) {
      throw new SecurityError(
        "INVALID_CREDENTIALS",
        "Check your current password and try again.",
      );
    }
    return user;
  }

  async function requireFactor(userId: string, code?: string) {
    const result = await verifySecondFactor(
      client,
      userId,
      code,
      encryptionKey,
      now(),
    );
    if (!result.valid)
      throw new SecurityError(
        code ? "INVALID_CREDENTIALS" : "MFA_REQUIRED",
        "Enter a new authenticator code or an unused recovery code.",
      );
    return result.changeId;
  }

  function revoke(userId: string, changeId: string): SqlStatement[] {
    return ["sessions", "email_tokens"].map((table) => ({
      sql: `DELETE FROM ${table} WHERE user_id = ? AND EXISTS (SELECT 1 FROM user_mfa WHERE user_id = ? AND change_id = ?)`,
      args: [userId, userId, changeId],
    }));
  }

  return {
    async status(userId: string) {
      const mfa = await getMfa(client, userId);
      const codes = await client.execute({
        sql: "SELECT COUNT(*) AS count FROM mfa_recovery_codes WHERE user_id = ?",
        args: [userId],
      });
      return {
        enabled: Boolean(mfa?.enabled_at),
        available: hasEncryptionKey(encryptionKey),
        recoveryCodesRemaining: Number(codes.rows[0]?.count ?? 0),
      };
    },

    async beginEnrollment(userId: string, password: string) {
      const user = await reauthenticate(userId, password);
      const secret = generateSecret();
      const encrypted = encryptSecret(secret, userId, encryptionKey);
      const result = await client.execute({
        sql: `INSERT INTO user_mfa (user_id, pending_secret, pending_expires_at, change_id)
          SELECT id, ?, ?, ? FROM users WHERE id = ? AND password_hash = ? AND disabled_at IS NULL
          ON CONFLICT(user_id) DO UPDATE SET pending_secret = excluded.pending_secret, pending_expires_at = excluded.pending_expires_at
          WHERE user_mfa.enabled_at IS NULL RETURNING user_id`,
        args: [
          encrypted,
          new Date(now().getTime() + 600_000).toISOString(),
          randomUUID(),
          userId,
          user.passwordHash,
        ],
      });
      if (!result.rows.length)
        throw new SecurityError(
          "CONFLICT",
          "Authenticator protection is already enabled.",
        );
      return {
        secret,
        uri: generateURI({
          issuer: "Bangalore Bikes",
          label: user.email,
          secret,
        }),
      };
    },

    async confirmEnrollment(userId: string, password: string, code: string) {
      const user = await reauthenticate(userId, password);
      const mfa = await getMfa(client, userId);
      if (
        !mfa?.pending_secret ||
        mfa.enabled_at ||
        String(mfa.pending_expires_at) <= now().toISOString()
      ) {
        throw new SecurityError(
          "CONFLICT",
          "Setup expired. Start authenticator setup again.",
        );
      }
      const counter = totpCounter(
        decryptSecret(String(mfa.pending_secret), userId, encryptionKey),
        code.trim(),
        now(),
      );
      if (counter === null)
        throw new SecurityError(
          "INVALID_CREDENTIALS",
          "That authenticator code did not match.",
        );
      const changeId = randomUUID();
      const recoveryCodes = Array.from({ length: 10 }, () =>
        randomBytes(16).toString("hex"),
      );
      const results = await client.batch(
        [
          {
            sql: `UPDATE user_mfa SET secret_encrypted = pending_secret, pending_secret = NULL, pending_expires_at = NULL,
            enabled_at = ?, last_counter = ?, change_id = ? WHERE user_id = ? AND enabled_at IS NULL
            AND pending_secret = ? AND pending_expires_at > ?
            AND EXISTS (SELECT 1 FROM users WHERE id = ? AND password_hash = ? AND disabled_at IS NULL) RETURNING user_id`,
            args: [
              now().toISOString(),
              counter,
              changeId,
              userId,
              mfa.pending_secret as string,
              now().toISOString(),
              userId,
              user.passwordHash,
            ],
          },
          ...recoveryCodes.map(
            (code): SqlStatement => ({
              sql: `INSERT INTO mfa_recovery_codes (user_id, code_hash) SELECT ?, ?
            WHERE EXISTS (SELECT 1 FROM user_mfa WHERE user_id = ? AND change_id = ?)`,
              args: [userId, hashToken(code), userId, changeId],
            }),
          ),
          ...revoke(userId, changeId),
        ],
        "write",
      );
      if (!results[0].rows.length)
        throw new SecurityError("CONFLICT", "Setup changed. Start again.");
      return { recoveryCodes };
    },

    async changePassword(
      userId: string,
      currentPassword: string,
      nextPassword: string,
      code?: string,
    ) {
      const problem = passwordProblem(nextPassword);
      if (problem) throw new SecurityError("INVALID_INPUT", problem);
      const user = await reauthenticate(userId, currentPassword);
      const changeId = await requireFactor(userId, code);
      const nextHash = await hashPassword(nextPassword);
      const results = await client.batch(
        [
          {
            sql: `UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?
            AND COALESCE((SELECT change_id FROM user_mfa WHERE user_id = ?), '') = ? RETURNING id`,
            args: [nextHash, userId, user.passwordHash, userId, changeId],
          },
          ...["sessions", "email_tokens"].map(
            (table): SqlStatement => ({
              sql: `DELETE FROM ${table} WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND password_hash = ?)`,
              args: [userId, userId, nextHash],
            }),
          ),
        ],
        "write",
      );
      if (!results[0].rows.length)
        throw new SecurityError(
          "CONFLICT",
          "The account changed. Sign in again.",
        );
    },

    async disableMfa(userId: string, password: string, code?: string) {
      const user = await reauthenticate(userId, password);
      const previousChange = await requireFactor(userId, code);
      const changeId = randomUUID();
      const results = await client.batch(
        [
          {
            sql: `UPDATE user_mfa SET secret_encrypted = NULL, enabled_at = NULL, pending_secret = NULL,
            pending_expires_at = NULL, last_counter = -1, change_id = ?
            WHERE user_id = ? AND enabled_at IS NOT NULL AND change_id = ?
            AND EXISTS (SELECT 1 FROM users WHERE id = ? AND password_hash = ? AND disabled_at IS NULL) RETURNING user_id`,
            args: [changeId, userId, previousChange, userId, user.passwordHash],
          },
          {
            sql: "DELETE FROM mfa_recovery_codes WHERE user_id = ? AND EXISTS (SELECT 1 FROM user_mfa WHERE user_id = ? AND change_id = ?)",
            args: [userId, userId, changeId],
          },
          ...revoke(userId, changeId),
        ],
        "write",
      );
      if (!results[0].rows.length)
        throw new SecurityError(
          "CONFLICT",
          "Authenticator settings changed. Refresh and try again.",
        );
    },
  };
}
