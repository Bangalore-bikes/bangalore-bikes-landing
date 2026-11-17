export const SESSION_COOKIE = "bb_session";

/** Session cookies are opaque, http-only and never readable from JavaScript. */
export function serializeSessionCookie(
  token: string,
  options: { secure: boolean; maxAgeSeconds?: number },
): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${options.maxAgeSeconds ?? 30 * 24 * 60 * 60}`,
  ];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function serializeClearedSessionCookie(options: { secure: boolean }): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== SESSION_COOKIE) continue;
    const value = part.slice(index + 1).trim();
    return value || null;
  }
  return null;
}

export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}
