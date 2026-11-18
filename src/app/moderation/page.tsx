import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ModerationQueue, type QueueItem } from "@/components/posts/moderation-queue";
import { getServerUser } from "@/lib/auth/server";
import { getPostsClient } from "@/lib/db";
import { listPending } from "@/lib/posts/repository";

export const metadata: Metadata = {
  title: "Moderation queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/moderation");

  if (user.role !== "moderator") {
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Moderators only</h1>
        <p className="mt-2 text-muted-foreground">
          This page is for the moderators who review new authors&apos; first posts.
        </p>
      </main>
    );
  }

  const pending = await listPending(getPostsClient());
  const items: QueueItem[] = pending.map((post) => ({
    id: post.id,
    title: post.title,
    summary: post.summary,
    bodyHtml: post.bodyHtml,
    authorName: post.author?.displayName ?? "Unknown author",
    authorHandle: post.author?.handle ?? "unknown",
    trustLevel: post.author?.trustLevel ?? 0,
    updatedAt: post.updatedAt,
    version: post.version,
  }));

  return (
    <main className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Moderation queue</h1>
        <p className="text-muted-foreground">
          {items.length === 0
            ? "Nothing is waiting."
            : `${items.length} post${items.length === 1 ? "" : "s"} waiting, oldest first.`}
        </p>
      </header>
      <ModerationQueue items={items} />
    </main>
  );
}
