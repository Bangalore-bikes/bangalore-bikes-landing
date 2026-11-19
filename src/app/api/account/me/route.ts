import { resolveUser } from "@/lib/auth/guards";
import { hasDatabaseConfig } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in, for the navbar. Never returns the email address. */
export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return jsonOk({ user: null });
  try {
    const user = await resolveUser(request);
    return jsonOk({
      user: user
        ? { displayName: user.displayName, handle: user.handle, role: user.role }
        : null,
    });
  } catch {
    return jsonOk({ user: null });
  }
}
