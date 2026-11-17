import { requireUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { revalidatePost } from "@/lib/posts/revalidate";
import { submitPost } from "@/lib/posts/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireUser(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");
  const expectedVersion = Number(body.expectedVersion);
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    return jsonError(400, "expectedVersion is required");
  }
  const publish = body.publish === undefined ? true : body.publish === true;

  const { id } = await context.params;
  try {
    const post = await submitPost(client, {
      id,
      authorId: guard.user.id,
      expectedVersion,
      publish,
    });
    revalidatePost(post.slug);
    return jsonOk({ post });
  } catch (error) {
    return errorResponse(error);
  }
}
