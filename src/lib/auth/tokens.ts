import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type IssuedToken = { token: string; hash: string };

/**
 * Only the hash is persisted. A database leak therefore does not hand over
 * usable verification or reset links.
 */
export function createToken(): IssuedToken {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
