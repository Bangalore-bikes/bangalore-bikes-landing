import { cookies } from "next/headers";

import { getPostsClient, hasDatabaseConfig } from "../db.ts";
import { siteOrigin } from "../siteMetadata.ts";
import { createAuthService, type SessionUser } from "./service.ts";
import { SESSION_COOKIE } from "./session.ts";

/**
 * Server-component session read. Route handlers use the `Request`-based guards
 * instead so the same logic stays testable without the Next runtime.
 */
export async function getServerUser(): Promise<SessionUser | null> {
  if (!hasDatabaseConfig()) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await createAuthService({
      client: getPostsClient(),
      mail: { configured: false, send: async () => undefined },
      baseUrl: siteOrigin,
    }).currentUser(token);
  } catch {
    return null;
  }
}
