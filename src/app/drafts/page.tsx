import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DraftsList, type DraftRow } from "@/components/posts/drafts-list";
import { Button } from "@/components/ui/button";
import { getServerUser } from "@/lib/auth/server";
import { getPostsClient } from "@/lib/db";
import { listByAuthor } from "@/lib/posts/repository";

export const metadata: Metadata = {
  title: "Your drafts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function wordCount(markdown: string): number {
  const trimmed = markdown.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default async function DraftsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/drafts");

  const posts = await listByAuthor(getPostsClient(), user.id);
  const drafts: DraftRow[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status,
    updatedAt: post.updatedAt,
    version: post.version,
    wordCount: wordCount(post.bodyMd),
    moderationNote: post.moderationNote,
  }));

  return (
    <main className="space-y-8 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Your posts</h1>
          <p className="text-muted-foreground">
            Signed in as {user.displayName} ({user.email}).{" "}
            {user.trustLevel === 0
              ? "New authors are reviewed before publishing."
              : "Your posts publish immediately."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="h-11">
            <Link href="/account/security">Account security</Link>
          </Button>
          <Button asChild className="h-11">
            <Link href="/write">Write a new post</Link>
          </Button>
        </div>
      </header>

      <DraftsList drafts={drafts} />
    </main>
  );
}
