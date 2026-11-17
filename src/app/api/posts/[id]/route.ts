import { requireUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { revalidatePost } from "@/lib/posts/revalidate";
import { getPostById, updateDraft } from "@/lib/posts/repository";
import { postInputSchema } from "@/lib/posts/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const { id } = await context.params;
  const post = await getPostById(client, id);
  if (!post) return jsonError(404, "Post not found");
  if (post.authorId !== guard.user.id && guard.user.role !== "moderator") {
    return jsonError(403, "This post belongs to another author");
  }
  return jsonOk({ post });
}

export async function PUT(request: Request, context: Context) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");
  const { expectedVersion: rawExpectedVersion, ...input } = body;
  const expectedVersion = Number(rawExpectedVersion);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    return jsonError(400, "expectedVersion is required");
  }

  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return jsonError(400, "Check the highlighted fields", {
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "post"}: ${issue.message}`,
      ),
    });
  }

  const { id } = await context.params;
  try {
    const post = await updateDraft(client, {
      id,
      authorId: guard.user.id,
      input: parsed.data,
      expectedVersion,
    });
    // A save can publish or pull a post back into review.
    if (post.status === "published" || post.status === "pending")
      revalidatePost(post.slug);
    return jsonOk({ post });
  } catch (error) {
    return errorResponse(error);
  }
}
