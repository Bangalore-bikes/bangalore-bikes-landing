import { requireUser } from "@/lib/auth/guards";
import { createSecurityService } from "@/lib/auth/security";
import {
  isSecureRequest,
  serializeClearedSessionCookie,
} from "@/lib/auth/session";
import { hashToken } from "@/lib/auth/tokens";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasDatabaseConfig())
    return jsonError(503, "Community accounts are not available yet.");
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);
  try {
    return jsonOk(
      await createSecurityService({ client }).status(guard.user.id),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig())
    return jsonError(503, "Community accounts are not available yet.");
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);
  try {
    const limiter = createRateLimiter(client);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    for (const [key, limit] of [
      [`security:ip:${hashToken(ip)}`, 20],
      [`security:user:${guard.user.id}`, 5],
    ] as const) {
      const result = await limiter.hit(key, limit, 60);
      if (!result.allowed)
        return Response.json(
          { message: "Too many attempts. Wait a minute and try again." },
          {
            status: 429,
            headers: {
              "Retry-After": String(result.retryAfter),
              "Cache-Control": "no-store",
            },
          },
        );
    }
    const body = await readJson(request);
    if (!body)
      return jsonError(400, "Send a valid JSON request from this site.");
    const password = typeof body.password === "string" ? body.password : "";
    const code = typeof body.code === "string" ? body.code : "";
    const security = createSecurityService({ client });
    if (body.action === "begin-mfa")
      return jsonOk(await security.beginEnrollment(guard.user.id, password));
    if (body.action === "confirm-mfa") {
      const result = await security.confirmEnrollment(
        guard.user.id,
        password,
        code,
      );
      return jsonOk(result, 200, {
        "Set-Cookie": serializeClearedSessionCookie({
          secure: isSecureRequest(request),
        }),
      });
    }
    if (body.action === "change-password") {
      await security.changePassword(
        guard.user.id,
        password,
        typeof body.newPassword === "string" ? body.newPassword : "",
        code,
      );
    } else if (body.action === "disable-mfa") {
      await security.disableMfa(guard.user.id, password, code);
    } else if (body.action === "sign-out-everywhere") {
      // Reuse password rotation to verify password/MFA and revoke tokens atomically.
      await security.changePassword(guard.user.id, password, password, code);
    } else return jsonError(400, "Unknown account action.");
    return jsonOk({ message: "Your account is updated. Sign in again." }, 200, {
      "Set-Cookie": serializeClearedSessionCookie({
        secure: isSecureRequest(request),
      }),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
