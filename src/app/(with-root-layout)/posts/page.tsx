import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { tagLabel } from "@/lib/posts/format";
import { listPublished } from "@/lib/posts/repository";
import { itemListJsonLd, jsonLdScript } from "@/lib/seo/jsonld";
import {
  createPageMetadata,
  isPreviewDeployment,
} from "@/lib/siteMetadata";

export const revalidate = 60;

const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const base = createPageMetadata("/posts");
  if (!hasDatabaseConfig()) {
    return { ...base, robots: { index: false, follow: true } };
  }
  try {
    const newest = await listPublished(getPostsClient(), { limit: 1 });
    return {
      ...base,
      robots: { index: newest.length > 0 && !isPreviewDeployment, follow: true },
    };
  } catch {
    return { ...base, robots: { index: false, follow: true } };
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page: pageParam, tag: rawTag } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const tag = rawTag?.trim().toLowerCase() || undefined;

  if (!hasDatabaseConfig()) {
    return (
      <main className="space-y-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Rider posts</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Community publishing is not switched on for this deployment yet. The guides and
          ride plans elsewhere on the site are unaffected.
        </p>
      </main>
    );
  }

  let posts: Awaited<ReturnType<typeof listPublished>> = [];
  let hasMore = false;
  try {
    const rows = await listPublished(getPostsClient(), {
      limit: PAGE_SIZE + 1,
      offset: (page - 1) * PAGE_SIZE,
      tag,
    });
    hasMore = rows.length > PAGE_SIZE;
    posts = rows.slice(0, PAGE_SIZE);
  } catch {
    posts = [];
  }

  return (
    <main className="space-y-10 py-12 sm:py-16">
      {page === 1 && !tag && posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              itemListJsonLd({
                name: "Rider posts",
                path: "/posts",
                items: posts.map((post) => ({
                  name: post.title,
                  path: `/posts/${post.slug}`,
                })),
              }),
            ),
          }}
        />
      )}
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Written by riders
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {tag ? `Posts tagged ${tagLabel(tag)}` : "Ride reports, routes and honest notes"}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          What Bangalore riders learned on the road: which ghats are worth the early start,
          what breaks in the monsoon, and which workshop did the job properly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11">
            <Link href="/write">Write a post</Link>
          </Button>
          {tag && (
            <Button asChild variant="outline" className="h-11">
              <Link href="/posts">Clear filter</Link>
            </Button>
          )}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="text-lg font-medium">
            {tag ? "Nothing tagged that way yet" : "No rider posts yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tag
              ? "Try another tag, or read everything."
              : "Be the first: a route, a repair, a morning that went wrong."}
          </p>
          <Button asChild className="mt-4 h-11">
            <Link href={tag ? "/posts" : "/write"}>{tag ? "All posts" : "Write the first post"}</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <li key={post.id}>
              <PostCard post={post} priority={index < 3} />
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t pt-6">
          {page > 1 ? (
            <Link
              className="underline underline-offset-4"
              href={`/posts?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(page - 1) }).toString()}`}
            >
              Newer posts
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              className="underline underline-offset-4"
              href={`/posts?${new URLSearchParams({ ...(tag ? { tag } : {}), page: String(page + 1) }).toString()}`}
            >
              Older posts
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
