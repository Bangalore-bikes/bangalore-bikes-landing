import { requireUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { renderMarkdown } from "@/lib/markdown/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 60_000;

/** Preview runs the exact renderer that will run on submit. */
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const guard = await requireUser(request, getPostsClient());
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");
  const bodyMd = typeof body.bodyMd === "string" ? body.bodyMd : "";
  if (bodyMd.length > MAX_BODY) {
    return jsonError(413, "That draft is longer than the 60,000 character limit");
  }

  const rendered = await renderMarkdown(bodyMd);
  return jsonOk({ html: rendered.html, headings: rendered.headings });
}
