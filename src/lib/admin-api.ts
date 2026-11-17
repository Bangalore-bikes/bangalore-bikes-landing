import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions, hasAuthConfig, isAdminLogin } from "./auth";
import { ContentStoreError } from "./content-store";
import { publicPathsFor, type CollectionName } from "./content-config";

export type AdminGuard =
  | { ok: true; login: string }
  | { ok: false; status: number; message: string };

export async function requireAdmin(): Promise<AdminGuard> {
  if (!hasAuthConfig()) {
    return {
      ok: false,
      status: 503,
      message:
        "Admin sign-in is not configured. See docs/activation-guide.md.",
    };
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        ok: false,
        status: 401,
        message: "Sign in with GitHub to manage content.",
      };
    }
    if (!isAdminLogin(session.user.login)) {
      return {
        ok: false,
        status: 403,
        message: "This GitHub account is not an approved moderator.",
      };
    }
    return { ok: true, login: session.user.login as string };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Admin sessions are unavailable. Check the auth configuration.",
    };
  }
}

export function jsonError(status: number, message: string, issues?: string[]) {
  return Response.json(
    issues?.length ? { message, issues } : { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function storeErrorResponse(error: unknown) {
  if (error instanceof ContentStoreError) {
    if (error.code === "CONFLICT" || error.code === "SOURCE_CONFLICT") {
      return jsonError(409, error.message);
    }
    return jsonError(400, error.message);
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/no such table|unable to open database/i.test(message)) {
    return jsonError(
      503,
      "The content database is not initialized. Run npm run db:migrate first.",
    );
  }
  if (/TURSO_DATABASE_URL|TURSO_AUTH_TOKEN/.test(message)) {
    return jsonError(
      503,
      "The content database is not configured. See docs/activation-guide.md.",
    );
  }
  console.error("Content admin request failed", error);
  return jsonError(500, "The content operation failed.");
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 262_144) return null;
  try {
    const value = (await request.json()) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function revalidateContent(collection: CollectionName, id: string) {
  for (const path of publicPathsFor(collection, id)) {
    revalidatePath(path);
  }
  revalidatePath("/admin");
}
