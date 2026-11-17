import type { SqlClient } from "../content-store.ts";
import type { Mailer } from "../mail.ts";
import { passwordResetMail, verificationMail } from "../mail/templates.ts";
import { createRateLimiter } from "../rate-limit.ts";
import { hashPassword, passwordProblem, verifyPassword } from "./password.ts";
import {
  allocateHandle,
  consumeEmailToken,
  createSession,
  deleteSessionByTokenHash,
  deleteSessionsForUser,
  findEmailToken,
  findSessionByTokenHash,
  findUserByEmail,
  findUserById,
  insertEmailToken,
  insertUser,
  invalidateTokens,
  markEmailVerified,
  normalizeEmail,
  touchSession,
  updatePasswordHash,
  type StoredUser,
  type UserRole,
} from "./repository.ts";
import { createToken, hashToken } from "./tokens.ts";

export type AuthErrorCode =
  | "INVALID_INPUT"
  | "WEAK_PASSWORD"
  | "INVALID_CREDENTIALS"
  | "INVALID_TOKEN"
  | "UNVERIFIED"
  | "DISABLED"
  | "EMAIL_TAKEN"
  | "THROTTLED"
  | "NOT_CONFIGURED";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly retryAfter?: number;

  constructor(code: AuthErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  trustLevel: 0 | 1 | 2;
  emailVerified: boolean;
};

export const SESSION_DAYS = 30;
const VERIFY_HOURS = 24;
const RESET_MINUTES = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A short deny list, not a password-strength oracle. Length is the rule that
 * matters; this only stops the handful of passwords that are guessed first.
 */
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    handle: user.handle,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    trustLevel: user.trustLevel,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

let decoy: Promise<string> | null = null;

/**
 * Verifying a password that cannot match keeps a missing account and a wrong
 * password roughly the same cost, so timing does not enumerate addresses.
 */
async function decoyVerify(password: string): Promise<void> {
  decoy ??= hashPassword("decoy-password-that-is-never-valid");
  await verifyPassword(await decoy, password);
}

export type AuthService = ReturnType<typeof createAuthService>;

export function createAuthService(options: {
  client: SqlClient;
  mail: Mailer;
  baseUrl: string;
  adminEmails?: string[];
  now?: () => Date;
}) {
  const { client, mail } = options;
  const now = options.now ?? (() => new Date());
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const admins = new Set(
    (options.adminEmails ?? [])
      .map((entry) => normalizeEmail(entry))
      .filter(Boolean),
  );
  const limiter = createRateLimiter(client);

  async function throttle(key: string, limit: number, windowSeconds: number) {
    const result = await limiter.hit(key, limit, windowSeconds);
    if (!result.allowed) {
      throw new AuthError(
        "THROTTLED",
        "Too many attempts. Wait a few minutes and try again.",
        windowSeconds,
      );
    }
  }

  async function issueSession(userId: string): Promise<string> {
    const issued = createToken();
    const issuedAt = now();
    await createSession(client, {
      userId,
      tokenHash: issued.hash,
      createdAt: issuedAt.toISOString(),
      expiresAt: new Date(
        issuedAt.getTime() + SESSION_DAYS * DAY_MS,
      ).toISOString(),
    });
    return issued.token;
  }

  async function safeSend(to: string, subject: string, text: string) {
    try {
      await mail.send({ to, subject, text });
    } catch (error) {
      // A mail outage must not turn a valid account into a 500 the user cannot
      // act on. The verification link stays valid and can be resent.
      console.error(
        "Auth mail failed",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    /** Creates an unverified account and sends the confirmation link. */
    async signUp(input: {
      email: string;
      password: string;
      displayName: string;
      ip?: string;
    }): Promise<{ user: SessionUser; mailSent: boolean }> {
      const email = normalizeEmail(input.email);
      await throttle(
        `signup:ip:${hashToken(input.ip?.trim() || "unknown").slice(0, 32)}`,
        5,
        900,
      );
      await throttle(`signup:acct:${hashToken(email).slice(0, 32)}`, 3, 900);
      const displayName = input.displayName.trim();
      if (!EMAIL.test(email)) {
        throw new AuthError("INVALID_INPUT", "Enter a valid email address");
      }
      if (displayName.length < 2 || displayName.length > 60) {
        throw new AuthError(
          "INVALID_INPUT",
          "Use a display name of 2 to 60 characters",
        );
      }
      const problem = passwordProblem(input.password);
      if (problem) throw new AuthError("WEAK_PASSWORD", problem);
      if (COMMON_PASSWORDS.has(input.password.trim().toLowerCase())) {
        throw new AuthError(
          "WEAK_PASSWORD",
          "That password is too common to be safe",
        );
      }
      if (await findUserByEmail(client, email)) {
        throw new AuthError(
          "EMAIL_TAKEN",
          "An account already uses that email address",
        );
      }

      const passwordHash = await hashPassword(input.password);
      const handle = await allocateHandle(client, displayName, email);
      let user: StoredUser;
      try {
        user = await insertUser(client, {
          email,
          passwordHash,
          handle,
          displayName,
          createdAt: now().toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/UNIQUE constraint failed: users\.(email|handle)/i.test(message)) {
          throw new AuthError(
            "EMAIL_TAKEN",
            "An account already uses that email address",
          );
        }
        throw error;
      }

      const issued = createToken();
      const createdAt = now();
      await insertEmailToken(client, {
        userId: user.id,
        purpose: "verify",
        tokenHash: issued.hash,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(
          createdAt.getTime() + VERIFY_HOURS * 60 * 60 * 1000,
        ).toISOString(),
      });

      const template = verificationMail({
        displayName: user.displayName,
        url: `${baseUrl}/verify?token=${encodeURIComponent(issued.token)}`,
        hours: VERIFY_HOURS,
      });
      await safeSend(user.email, template.subject, template.text);

      return { user: toSessionUser(user), mailSent: mail.configured };
    },

    /** Single use, and a success also signs the author in. */
    async verifyEmail(
      token: string,
    ): Promise<{ user: SessionUser; session: string }> {
      const stored = await findEmailToken(client, hashToken(token), "verify");
      const current = now();
      if (!stored)
        throw new AuthError("INVALID_TOKEN", "That link is not valid");
      if (new Date(stored.expiresAt).getTime() <= current.getTime()) {
        throw new AuthError(
          "INVALID_TOKEN",
          "That link has expired. Request a new one.",
        );
      }
      if (
        !(await consumeEmailToken(client, stored.id, current.toISOString()))
      ) {
        throw new AuthError("INVALID_TOKEN", "That link has already been used");
      }

      const isModerator = admins.has(
        (await findUserById(client, stored.userId))?.email ?? "",
      );
      await markEmailVerified(
        client,
        stored.userId,
        current.toISOString(),
        isModerator ? "moderator" : undefined,
      );
      const user = await findUserById(client, stored.userId);
      if (!user) throw new AuthError("INVALID_TOKEN", "That link is not valid");
      return {
        user: toSessionUser(user),
        session: await issueSession(user.id),
      };
    },

    async logIn(input: {
      email: string;
      password: string;
      ip?: string;
    }): Promise<{ user: SessionUser; session: string }> {
      const email = normalizeEmail(input.email);
      const ip = input.ip?.trim();
      const accountKey = `login:acct:${hashToken(email).slice(0, 32)}`;
      await throttle(accountKey, 5, 900);
      if (ip) await throttle(`login:ip:${hashToken(ip).slice(0, 32)}`, 20, 900);

      const user = await findUserByEmail(client, email);
      if (!user) {
        await decoyVerify(input.password);
        throw new AuthError(
          "INVALID_CREDENTIALS",
          "That email and password do not match an account",
        );
      }
      if (!(await verifyPassword(user.passwordHash, input.password))) {
        throw new AuthError(
          "INVALID_CREDENTIALS",
          "That email and password do not match an account",
        );
      }
      if (user.disabledAt) {
        throw new AuthError("DISABLED", "This account has been disabled");
      }
      if (!user.emailVerifiedAt) {
        throw new AuthError(
          "UNVERIFIED",
          "Confirm your email address before signing in. Check your inbox for the link.",
        );
      }
      return {
        user: toSessionUser(user),
        session: await issueSession(user.id),
      };
    },

    async logOut(token: string): Promise<void> {
      await deleteSessionByTokenHash(client, hashToken(token));
    },

    async currentUser(token: string): Promise<SessionUser | null> {
      const session = await findSessionByTokenHash(client, hashToken(token));
      if (!session) return null;
      const current = now();
      if (new Date(session.expiresAt).getTime() <= current.getTime()) {
        await deleteSessionByTokenHash(client, hashToken(token));
        return null;
      }
      const user = await findUserById(client, session.userId);
      if (!user || user.disabledAt) return null;

      await touchSession(
        client,
        session.id,
        current.toISOString(),
        new Date(current.getTime() + SESSION_DAYS * DAY_MS).toISOString(),
        new Date(current.getTime() - DAY_MS).toISOString(),
      );
      return toSessionUser(user);
    },

    /**
     * The response never depends on whether the address exists, so the form
     * cannot be used to enumerate accounts.
     */
    async requestReset(input: { email: string; ip?: string }): Promise<void> {
      const email = normalizeEmail(input.email);
      if (input.ip?.trim()) {
        await throttle(
          `reset:ip:${hashToken(input.ip.trim()).slice(0, 32)}`,
          5,
          900,
        );
      }
      if (!EMAIL.test(email)) return;
      await throttle(`reset:acct:${hashToken(email).slice(0, 32)}`, 3, 900);

      const user = await findUserByEmail(client, email);
      if (!user || user.disabledAt) return;

      await invalidateTokens(client, user.id, "reset");
      const issued = createToken();
      const createdAt = now();
      await insertEmailToken(client, {
        userId: user.id,
        purpose: "reset",
        tokenHash: issued.hash,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(
          createdAt.getTime() + RESET_MINUTES * 60 * 1000,
        ).toISOString(),
      });

      const template = passwordResetMail({
        displayName: user.displayName,
        url: `${baseUrl}/reset?token=${encodeURIComponent(issued.token)}`,
        minutes: RESET_MINUTES,
      });
      await safeSend(user.email, template.subject, template.text);
    },

    async completeReset(input: {
      token: string;
      password: string;
    }): Promise<void> {
      const problem = passwordProblem(input.password);
      if (problem) throw new AuthError("WEAK_PASSWORD", problem);
      if (COMMON_PASSWORDS.has(input.password.trim().toLowerCase())) {
        throw new AuthError(
          "WEAK_PASSWORD",
          "That password is too common to be safe",
        );
      }

      const stored = await findEmailToken(
        client,
        hashToken(input.token),
        "reset",
      );
      const current = now();
      if (!stored)
        throw new AuthError("INVALID_TOKEN", "That link is not valid");
      if (new Date(stored.expiresAt).getTime() <= current.getTime()) {
        throw new AuthError(
          "INVALID_TOKEN",
          "That link has expired. Request a new one.",
        );
      }
      if (
        !(await consumeEmailToken(client, stored.id, current.toISOString()))
      ) {
        throw new AuthError("INVALID_TOKEN", "That link has already been used");
      }

      await updatePasswordHash(
        client,
        stored.userId,
        await hashPassword(input.password),
      );
      // A reset is the moment to cut off anything already holding a session.
      await deleteSessionsForUser(client, stored.userId);
    },
  };
}
