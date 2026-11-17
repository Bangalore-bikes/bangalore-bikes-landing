import { randomUUID } from "node:crypto";

import type { SqlClient, SqlResult, SqlStatement, SqlValue } from "../content-store.ts";
import type { TrustLevel } from "../posts/lifecycle.ts";
import { slugify, uniqueSlug } from "../posts/slugs.ts";

export type UserRole = "rider" | "moderator";

export type StoredUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  passwordHash: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  trustLevel: TrustLevel;
  approvedCount: number;
  rejectedCount: number;
  disabledAt: string | null;
  createdAt: string;
};

export type StoredSession = {
  id: string;
  userId: string;
  expiresAt: string;
  lastSeenAt: string;
};

export type TokenPurpose = "verify" | "reset";

const statement = (sql: string, args: SqlValue[] = []): SqlStatement => ({ sql, args });

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUser(row: SqlResult["rows"][number]): StoredUser {
  return {
    id: String(row.id),
    email: String(row.email),
    emailVerifiedAt: row.email_verified_at == null ? null : String(row.email_verified_at),
    passwordHash: String(row.password_hash),
    handle: String(row.handle),
    displayName: String(row.display_name),
    bio: row.bio == null ? null : String(row.bio),
    avatarUrl: row.avatar_url == null ? null : String(row.avatar_url),
    role: String(row.role) as UserRole,
    trustLevel: Number(row.trust_level) as TrustLevel,
    approvedCount: Number(row.approved_count),
    rejectedCount: Number(row.rejected_count),
    disabledAt: row.disabled_at == null ? null : String(row.disabled_at),
    createdAt: String(row.created_at),
  };
}

export async function findUserByEmail(
  client: SqlClient,
  email: string,
): Promise<StoredUser | null> {
  const result = await client.execute(
    statement("SELECT * FROM users WHERE email = ?", [normalizeEmail(email)]),
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(
  client: SqlClient,
  id: string,
): Promise<StoredUser | null> {
  const result = await client.execute(statement("SELECT * FROM users WHERE id = ?", [id]));
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserByHandle(
  client: SqlClient,
  handle: string,
): Promise<StoredUser | null> {
  const result = await client.execute(
    statement("SELECT * FROM users WHERE handle = ?", [handle.trim().toLowerCase()]),
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

/** Handles are URL-safe and permanent once the author has published. */
export async function allocateHandle(
  client: SqlClient,
  displayName: string,
  email: string,
): Promise<string> {
  const localPart = email.split("@")[0] ?? "rider";
  const base = slugify(displayName) || slugify(localPart) || "rider";
  const taken = await client.execute(
    statement("SELECT handle FROM users WHERE handle = ? OR handle LIKE ?", [
      base,
      `${base}-%`,
    ]),
  );
  return uniqueSlug(base.slice(0, 24), taken.rows.map((row) => String(row.handle)));
}

export async function insertUser(
  client: SqlClient,
  input: {
    email: string;
    passwordHash: string;
    handle: string;
    displayName: string;
    role?: UserRole;
    trustLevel?: TrustLevel;
    createdAt: string;
  },
): Promise<StoredUser> {
  const result = await client.execute(
    statement(
      `INSERT INTO users (id, email, password_hash, handle, display_name, role,
        trust_level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        randomUUID(),
        normalizeEmail(input.email),
        input.passwordHash,
        input.handle,
        input.displayName,
        input.role ?? "rider",
        input.trustLevel ?? 0,
        input.createdAt,
      ],
    ),
  );
  const row = result.rows[0];
  if (!row) throw new Error("The account could not be created");
  return toUser(row);
}

export async function markEmailVerified(
  client: SqlClient,
  userId: string,
  at: string,
  role?: UserRole,
): Promise<void> {
  await client.execute(
    statement(
      `UPDATE users SET email_verified_at = ?,
        role = COALESCE(?, role),
        trust_level = CASE WHEN ? = 'moderator' THEN 2 ELSE trust_level END
       WHERE id = ?`,
      [at, role ?? null, role ?? null, userId],
    ),
  );
}

export async function updatePasswordHash(
  client: SqlClient,
  userId: string,
  passwordHash: string,
): Promise<void> {
  await client.execute(
    statement("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]),
  );
}

export async function createSession(
  client: SqlClient,
  input: { userId: string; tokenHash: string; createdAt: string; expiresAt: string },
): Promise<string> {
  const id = randomUUID();
  await client.execute(
    statement(
      `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, input.userId, input.tokenHash, input.createdAt, input.expiresAt, input.createdAt],
    ),
  );
  return id;
}

export async function findSessionByTokenHash(
  client: SqlClient,
  tokenHash: string,
): Promise<StoredSession | null> {
  const result = await client.execute(
    statement("SELECT * FROM sessions WHERE token_hash = ?", [tokenHash]),
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    expiresAt: String(row.expires_at),
    lastSeenAt: String(row.last_seen_at),
  };
}

/**
 * Sliding expiry without a write on every request: the session is extended at
 * most once a day per session.
 */
export async function touchSession(
  client: SqlClient,
  sessionId: string,
  now: string,
  expiresAt: string,
  staleBefore: string,
): Promise<void> {
  await client.execute(
    statement(
      `UPDATE sessions SET last_seen_at = ?, expires_at = ?
       WHERE id = ? AND last_seen_at < ?`,
      [now, expiresAt, sessionId, staleBefore],
    ),
  );
}

export async function deleteSessionByTokenHash(
  client: SqlClient,
  tokenHash: string,
): Promise<void> {
  await client.execute(
    statement("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]),
  );
}

export async function deleteSessionsForUser(
  client: SqlClient,
  userId: string,
): Promise<void> {
  await client.execute(statement("DELETE FROM sessions WHERE user_id = ?", [userId]));
}

export async function insertEmailToken(
  client: SqlClient,
  input: {
    userId: string;
    purpose: TokenPurpose;
    tokenHash: string;
    createdAt: string;
    expiresAt: string;
  },
): Promise<void> {
  await client.execute(
    statement(
      `INSERT INTO email_tokens (id, user_id, purpose, token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        input.userId,
        input.purpose,
        input.tokenHash,
        input.createdAt,
        input.expiresAt,
      ],
    ),
  );
}

export type StoredEmailToken = {
  id: string;
  userId: string;
  purpose: TokenPurpose;
  expiresAt: string;
  usedAt: string | null;
};

export async function findEmailToken(
  client: SqlClient,
  tokenHash: string,
  purpose: TokenPurpose,
): Promise<StoredEmailToken | null> {
  const result = await client.execute(
    statement(
      "SELECT * FROM email_tokens WHERE token_hash = ? AND purpose = ?",
      [tokenHash, purpose],
    ),
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    purpose: String(row.purpose) as TokenPurpose,
    expiresAt: String(row.expires_at),
    usedAt: row.used_at == null ? null : String(row.used_at),
  };
}

/**
 * Marking the token used and reading it in one statement is what makes replay
 * impossible: the second attempt matches no unused row.
 */
export async function consumeEmailToken(
  client: SqlClient,
  id: string,
  usedAt: string,
): Promise<boolean> {
  const result = await client.execute(
    statement(
      `UPDATE email_tokens SET used_at = ?
       WHERE id = ? AND used_at IS NULL
       RETURNING id`,
      [usedAt, id],
    ),
  );
  return result.rows.length > 0;
}

export async function invalidateTokens(
  client: SqlClient,
  userId: string,
  purpose: TokenPurpose,
): Promise<void> {
  await client.execute(
    statement(
      "DELETE FROM email_tokens WHERE user_id = ? AND purpose = ? AND used_at IS NULL",
      [userId, purpose],
    ),
  );
}
