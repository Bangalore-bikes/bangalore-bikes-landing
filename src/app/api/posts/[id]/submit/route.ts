import { requireUser } from "@/lib/auth/guards";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { revalidatePost } from "@/lib/posts/revalidate";
import { submitPost } from "@/lib/posts/repository";
import { submitUrls } from "@/lib/seo/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function siteOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin
  );
}

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
    if (post.status === "published") {
      await submitUrls([
        `${siteOrigin(request)}/posts/${post.slug}`,
        `${siteOrigin(request)}/posts`,
      ]);
    }
    return jsonOk({ post });
  } catch (error) {
    return errorResponse(error);
  }
}
