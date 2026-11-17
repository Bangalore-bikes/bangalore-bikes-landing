import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { mailer } from "@/lib/mail";
import { createAuthService, AuthError } from "@/lib/auth/service";
import {
  isSecureRequest,
  readSessionToken,
  serializeClearedSessionCookie,
  serializeSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set([
  "signup",
  "login",
  "logout",
  "verify",
  "reset-request",
  "reset-complete",
]);

function stringField(
  body: Record<string, unknown> | null,
  key: string,
): string {
  const value = body?.[key];
  return typeof value === "string" ? value : "";
}

function originOf(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured || new URL(request.url).origin;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "";
}

/**
 * One endpoint for the whole auth surface. Every branch answers with the same
 * shape so the forms have a single client contract.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string[] }> },
) {
  const { action: segments } = await context.params;
  const action = segments?.[0] ?? "";
  if (!ACTIONS.has(action) || segments.length !== 1) {
    return jsonError(404, "Unknown auth action");
  }
  if (!hasDatabaseConfig()) {
    return jsonError(
      503,
      "Community accounts are not configured yet. See docs/activation-guide.md.",
    );
  }

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");

  const client = getPostsClient();
  const service = createAuthService({
    client,
    mail: mailer,
    baseUrl: originOf(request),
    adminEmails: (process.env.ADMIN_EMAILS ?? "").split(","),
  });
  const secure = isSecureRequest(request);

  try {
    switch (action) {
      case "signup": {
        try {
          await service.signUp({
            email: stringField(body, "email"),
            password: stringField(body, "password"),
            displayName: stringField(body, "displayName"),
            ip: clientIp(request),
          });
        } catch (error) {
          // An existing address must look exactly like a new one.
          if (!(error instanceof AuthError) || error.code !== "EMAIL_TAKEN") {
            throw error;
          }
        }
        return jsonOk({
          ok: true,
          message:
            "Check your inbox for a confirmation link. It expires in 24 hours.",
        });
      }

      case "login": {
        const { user, session } = await service.logIn({
          email: stringField(body, "email"),
          password: stringField(body, "password"),
          ip: clientIp(request),
        });
        return jsonOk({ ok: true, user }, 200, {
          "Set-Cookie": serializeSessionCookie(session, { secure }),
        });
      }

      case "logout": {
        const token = readSessionToken(request);
        if (token) await service.logOut(token);
        return jsonOk({ ok: true }, 200, {
          "Set-Cookie": serializeClearedSessionCookie({ secure }),
        });
      }

      case "verify": {
        const { user, session } = await service.verifyEmail(
          stringField(body, "token"),
        );
        return jsonOk({ ok: true, user }, 200, {
          "Set-Cookie": serializeSessionCookie(session, { secure }),
        });
      }

      case "reset-request": {
        await service.requestReset({
          email: stringField(body, "email"),
          ip: clientIp(request),
        });
        return jsonOk({
          ok: true,
          message:
            "If that address has an account, a reset link is on its way. It expires in 60 minutes.",
        });
      }

      case "reset-complete": {
        await service.completeReset({
          token: stringField(body, "token"),
          password: stringField(body, "password"),
        });
        return jsonOk({
          ok: true,
          message: "Your password is updated. Sign in with the new one.",
        });
      }

      default:
        return jsonError(404, "Unknown auth action");
    }
  } catch (error) {
    return errorResponse(error);
  }
}
