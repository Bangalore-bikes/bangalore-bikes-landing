import { Algorithm, hash, verify } from "@node-rs/argon2";

/** OWASP baseline for argon2id at the time of writing. */
const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

/** Bounded so a huge form field cannot be turned into a CPU amplifier. */
export const MAX_PASSWORD_LENGTH = 256;

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
      algorithm: Algorithm.Argon2id,
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
  if (password.length > MAX_PASSWORD_LENGTH) return "Use at most 256 characters";
  return null;
}
