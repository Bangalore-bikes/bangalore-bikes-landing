import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PostEditor, type EditablePost } from "@/components/posts/post-editor";
import { getServerUser } from "@/lib/auth/server";
import { getPostsClient } from "@/lib/db";
import { getPostById } from "@/lib/posts/repository";

export const metadata: Metadata = {
  title: "Write a post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/write");

  const { id } = await searchParams;
  let post: EditablePost | undefined;

  if (id) {
    const stored = await getPostById(getPostsClient(), id);
    if (!stored || stored.authorId !== user.id) notFound();
    post = {
      id: stored.id,
      slug: stored.slug,
      title: stored.title,
      summary: stored.summary,
      bodyMd: stored.bodyMd,
      tags: stored.tags,
      coverImageUrl: stored.coverImageUrl,
      version: stored.version,
      status: stored.status,
    };
  }

  return (
    <main className="space-y-6 py-10">
      {!user.emailVerified && (
        <p className="rounded-lg border border-dixie-600/40 bg-dixie-500/10 p-4 text-sm">
          Confirm your email address to publish. You can write and save drafts now.
        </p>
      )}
      <PostEditor post={post} />
    </main>
  );
}
