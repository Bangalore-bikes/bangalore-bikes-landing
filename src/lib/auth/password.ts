import { hash, verify } from "@node-rs/argon2";

/**
 * `Algorithm` is an ambient const enum, which `isolatedModules` cannot import
 * at runtime, so the documented value is used directly. Argon2id = 2 in
 * @node-rs/argon2 (Argon2d = 0, Argon2i = 1); asserted by the hash test.
 */
const ARGON2ID = 2;

/** OWASP baseline for argon2id at the time of writing. */
const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

/** Bounded so a huge form field cannot be turned into a CPU amplifier. */
export const MAX_PASSWORD_LENGTH = 256;

const COMMON_PASSWORDS = new Set([
  "passwordpassword",
  "123456789012",
  "qwertyuiop12",
  "letmein12345",
  "iloveyou1234",
  "bangalorebikes",
  "motorcycle12",
  "changeme1234",
]);

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain.slice(0, MAX_PASSWORD_LENGTH), OPTIONS);
}

/**
 * A malformed or truncated stored hash must read as "wrong password", never as
 * an error the caller might mistake for success.
 */
export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<boolean> {
  if (!storedHash || !plain) return false;
  try {
    return await verify(storedHash, plain.slice(0, MAX_PASSWORD_LENGTH), {
      algorithm: ARGON2ID,
    });
  } catch {
    return false;
  }
}

/**
 * Deliberately minimal strength rule: length beats character-class theatre.
 * The common-password check lives in the auth service, which owns the list.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 12) return "Use at least 12 characters";
  if (password.length > MAX_PASSWORD_LENGTH)
    return "Use at most 256 characters";
  if (COMMON_PASSWORDS.has(password.trim().toLowerCase()))
    return "That password is too common to be safe";
  return null;
}
