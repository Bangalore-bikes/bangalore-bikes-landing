import type { SqlClient } from "../content-store.ts";
import { getPostsClient, hasDatabaseConfig } from "../db.ts";
import type { SessionUser } from "./service.ts";
import { createAuthService } from "./service.ts";
import { readSessionToken } from "./session.ts";

export type UserGuard =
  | { ok: true; user: SessionUser }
  | { ok: false; status: number; message: string };

function unavailable(): UserGuard {
  return {
    ok: false,
    status: 503,
    message: "Community accounts are not configured. See docs/activation-guide.md.",
  };
}

export async function resolveUser(
  request: Request,
  client?: SqlClient,
): Promise<SessionUser | null> {
  if (!client && !hasDatabaseConfig()) return null;
  const token = readSessionToken(request);
  if (!token) return null;
  const service = createAuthService({
    client: client ?? getPostsClient(),
    mail: { configured: false, send: async () => undefined },
    baseUrl: new URL(request.url).origin,
  });
  return service.currentUser(token);
}

/**
 * Guards run inside every route handler, not only in middleware, so a session
 * revoked after sign-in is refused on the very next request.
 */
export async function requireUser(
  request: Request,
  client?: SqlClient,
): Promise<UserGuard> {
  if (!client && !hasDatabaseConfig()) return unavailable();
  const user = await resolveUser(request, client);
  if (!user) return { ok: false, status: 401, message: "Sign in to continue" };
  return { ok: true, user };
}

export async function requireModerator(
  request: Request,
  client?: SqlClient,
): Promise<UserGuard> {
  const guard = await requireUser(request, client);
  if (!guard.ok) return guard;
  if (guard.user.role !== "moderator") {
    return { ok: false, status: 403, message: "Moderator access is required" };
  }
  return guard;
}
