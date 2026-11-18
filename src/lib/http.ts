import { AuthError } from "./auth/service.ts";
import { PostError } from "./posts/repository.ts";
import { SecurityError } from "./auth/mfa.ts";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function jsonError(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
): Response {
  return Response.json({ message, ...extra }, { status, headers: NO_STORE });
}

export function jsonOk(
  body: Record<string, unknown> = { ok: true },
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

/**
 * One place that turns domain errors into status codes, so every route answers
 * a conflict with 409 and a missing row with 404 instead of drifting.
 */
export function errorResponse(error: unknown): Response {
  if (error instanceof SecurityError) {
    return jsonError(
      {
        INVALID_INPUT: 400,
        INVALID_CREDENTIALS: 401,
        MFA_REQUIRED: 401,
        CONFLICT: 409,
        NOT_CONFIGURED: 503,
      }[error.code],
      error.message,
      { code: error.code },
    );
  }
  if (error instanceof PostError) {
    switch (error.code) {
      case "INVALID_INPUT":
      case "NOTE_REQUIRED":
        return jsonError(400, error.message);
      case "NOT_FOUND":
        return jsonError(404, error.message);
      case "FORBIDDEN":
        return jsonError(403, error.message);
      case "CONFLICT":
      case "BAD_STATE":
        return jsonError(409, error.message);
    }
  }

  if (error instanceof AuthError) {
    const status = {
      INVALID_INPUT: 400,
      WEAK_PASSWORD: 400,
      INVALID_CREDENTIALS: 401,
      INVALID_TOKEN: 400,
      UNVERIFIED: 403,
      DISABLED: 403,
      EMAIL_TAKEN: 409,
      THROTTLED: 429,
      NOT_CONFIGURED: 503,
      MFA_REQUIRED: 401,
    }[error.code];
    const headers: Record<string, string> = { ...NO_STORE };
    if (error.code === "THROTTLED")
      headers["Retry-After"] = String(error.retryAfter ?? 900);
    return Response.json(
      { message: error.message, code: error.code },
      { status, headers },
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  if (/no such table|unable to open database/i.test(message)) {
    return jsonError(
      503,
      "The community database is not initialized. Run npm run db:migrate:posts first.",
    );
  }
  if (/TURSO_DATABASE_URL|TURSO_AUTH_TOKEN/.test(message)) {
    return jsonError(
      503,
      "The community database is not configured. See docs/activation-guide.md.",
    );
  }

  console.error("Community request failed", error);
  return jsonError(500, "The request could not be completed.");
}

/** Rejects oversized bodies before parsing, so a huge post cannot be buffered. */
export const MAX_JSON_BYTES = 131_072;

export async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return null;
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return null;
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_JSON_BYTES) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  try {
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_JSON_BYTES) {
        void reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
