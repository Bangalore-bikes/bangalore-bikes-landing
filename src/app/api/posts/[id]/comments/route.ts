import { requireUser, resolveUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import {
  addComment,
  CommentError,
  deleteComment,
  listComments,
} from "@/lib/posts/comments";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function commentFailure(error: unknown): Response {
  if (error instanceof CommentError) {
    const status = { INVALID_INPUT: 400, NOT_FOUND: 404, FORBIDDEN: 403 }[error.code];
    return jsonError(status, error.message);
  }
  return jsonError(500, "Something went wrong. Try again.");
}

export async function GET(request: Request, context: Context) {
  if (!hasDatabaseConfig()) return jsonOk({ comments: [], viewer: null });
  const { id } = await context.params;
  try {
    const client = getPostsClient();
    const user = await resolveUser(request, client);
    return jsonOk({
      comments: await listComments(client, id),
      viewer: user ? { id: user.id, role: user.role } : null,
    });
  } catch (error) {
    return commentFailure(error);
  }
}

export async function POST(request: Request, context: Context) {
  if (!hasDatabaseConfig()) return jsonError(503, "Comments are not configured yet.");
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const limit = await createRateLimiter(client).hit(
    `comment:create:${guard.user.id}`,
    10,
    3600,
  );
  if (!limit.allowed) return jsonError(429, "You are commenting quickly. Try again later.");

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");
  const { id } = await context.params;
  try {
    await addComment(client, { postId: id, authorId: guard.user.id, body: body.body });
    return jsonOk({ comments: await listComments(client, id) }, 201);
  } catch (error) {
    return commentFailure(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!hasDatabaseConfig()) return jsonError(503, "Comments are not configured yet.");
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const commentId = new URL(request.url).searchParams.get("commentId") ?? "";
  const { id } = await context.params;
  try {
    await deleteComment(client, { commentId, user: guard.user });
    return jsonOk({ comments: await listComments(client, id) });
  } catch (error) {
    return commentFailure(error);
  }
}
