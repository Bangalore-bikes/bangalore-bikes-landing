import { requireModerator } from "@/lib/auth/guards";
import { findUserById } from "@/lib/auth/repository";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { errorResponse, jsonError, jsonOk, readJson } from "@/lib/http";
import { mailer } from "@/lib/mail";
import { moderationMail } from "@/lib/mail/templates";
import { revalidatePost } from "@/lib/posts/revalidate";
import { moderatePost, type ModerationAction } from "@/lib/posts/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const ACTIONS = new Set<ModerationAction>(["approve", "reject", "unpublish"]);

function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
}

export async function POST(request: Request, context: Context) {
  if (!hasDatabaseConfig()) {
    return jsonError(503, "Community publishing is not configured yet.");
  }
  const client = getPostsClient();
  const guard = await requireModerator(request, client);
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const body = await readJson(request);
  if (!body) return jsonError(400, "Send a JSON object");
  const action = String(body.action ?? "") as ModerationAction;
  if (!ACTIONS.has(action)) return jsonError(400, "Choose approve, reject or unpublish");

  const { id } = await context.params;
  try {
    const post = await moderatePost(client, {
      id,
      moderatorId: guard.user.id,
      action,
      note: typeof body.note === "string" ? body.note : null,
    });
    revalidatePost(post.slug);

    // Best effort: the decision stands even if the notification cannot be sent.
    const author = await findUserById(client, post.authorId);
    if (author) {
      const template = moderationMail({
        displayName: author.displayName,
        title: post.title,
        outcome: post.status === "published" ? "published" : post.status === "unpublished" ? "unpublished" : "rejected",
        note: post.moderationNote,
        url: `${siteOrigin(request)}/posts/${post.slug}`,
      });
      mailer
        .send({ to: author.email, subject: template.subject, text: template.text })
        .catch((error: unknown) =>
          console.error(
            "Moderation mail failed",
            error instanceof Error ? error.message : String(error),
          ),
        );
    }

    return jsonOk({ post });
  } catch (error) {
    return errorResponse(error);
  }
}
