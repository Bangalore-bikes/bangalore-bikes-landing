import { requireUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { postInputSchema } from "@/lib/posts/schema";
import { createDraft, listByAuthor } from "@/lib/posts/repository";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const posts = await listByAuthor(client, guard.user.id);
  return jsonOk({ posts });
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const limit = await createRateLimiter(client).hit(
    `post:create:${guard.user.id}`,
    10,
    3600,
  );
  if (!limit.allowed) {
    return jsonError(429, "You have created several drafts recently. Try again later.");
  }

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");

  const parsed = postInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "Check the highlighted fields",
      { issues: parsed.error.issues.map((issue) => `${issue.path.join(".") || "post"}: ${issue.message}`) },
    );
  }

  try {
    const post = await createDraft(client, {
      authorId: guard.user.id,
      input: parsed.data,
    });
    return jsonOk({ post }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
