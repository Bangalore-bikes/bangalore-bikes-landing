const loginPattern = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;

/** Comma-separated GitHub logins; `@`, casing, and duplicates are normalized. */
export function parseAdminLogins(value: string | undefined | null): string[] {
  const logins = new Set<string>();
  for (const part of (value ?? "").split(",")) {
    const login = part.trim().replace(/^@/, "").toLowerCase();
    if (loginPattern.test(login)) logins.add(login);
  }
  return [...logins];
}

export function isAdminLogin(
  login: string | null | undefined,
  allowlist: string[] = parseAdminLogins(process.env.ADMIN_GITHUB_LOGINS),
): boolean {
  if (!login) return false;
  return allowlist.includes(login.toLowerCase());
}
