import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/posts/post-card";
import { findUserByHandle } from "@/lib/auth/repository";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { formatDate } from "@/lib/posts/format";
import { listByAuthor } from "@/lib/posts/repository";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (!hasDatabaseConfig()) return { title: "Writer not found", robots: { index: false } };
  const user = await findUserByHandle(getPostsClient(), handle).catch(() => null);
  if (!user) return { title: "Writer not found", robots: { index: false } };
  const url = `${siteOrigin}/writers/${user.handle}`;
  return {
    title: `${user.displayName} — rider posts`,
    description:
      user.bio?.slice(0, 160) ??
      `Ride reports and notes written by ${user.displayName} for the Bangalore Bikes community.`,
    alternates: { canonical: url },
    robots: { index: !isPreviewDeployment, follow: true },
    openGraph: {
      type: "profile",
      title: `${user.displayName} — Bangalore Bikes`,
      url,
    },
  };
}

export default async function WriterPage({ params }: Props) {
  const { handle } = await params;
  if (!hasDatabaseConfig()) notFound();

  const client = getPostsClient();
  const user = await findUserByHandle(client, handle);
  if (!user) notFound();

  const posts = await listByAuthor(client, user.id, { publishedOnly: true });

  return (
    <main className="space-y-10 py-12 sm:py-16">
      <header className="flex flex-wrap items-start gap-5">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground">
            @{user.handle} · joined {formatDate(user.createdAt)} ·{" "}
            {posts.length} published post{posts.length === 1 ? "" : "s"}
          </p>
          {user.bio && <p className="max-w-2xl leading-relaxed">{user.bio}</p>}
        </div>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No published posts yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
