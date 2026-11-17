"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import type { CommunityPost } from "@/lib/communityFeed";
import { communityHighlights } from "@/data/community-posts";
import { Button } from "@/components/ui/button";

function Post({
  post,
  featured = false,
}: {
  post: CommunityPost;
  featured?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article
      className={
        featured
          ? "overflow-hidden rounded-xl bg-secondary text-secondary-foreground"
          : "border-b border-border py-5 first:pt-0"
      }
    >
      {featured && post.imageUrl && !imageFailed && (
        <div className="relative h-52 w-full sm:h-64">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt ?? "Preview attached to this Reddit post"}
            fill
            unoptimized
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
      <div className={featured ? "p-6 sm:p-8" : ""}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <MessageSquare className="size-4" aria-hidden="true" />
          <span>{post.author ? "u/" + post.author : "r/BangaloreBikes"}</span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              }).format(new Date(post.publishedAt))}
            </time>
          )}
        </div>
        <h3
          className={
            featured
              ? "text-2xl font-semibold leading-snug"
              : "text-lg font-semibold leading-snug"
          }
        >
          <a href={post.url} className="underline-offset-4 hover:underline">
            {post.title}
          </a>
        </h3>
        {post.summary && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        )}
        <a
          href={post.url}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
        >
          Open the discussion{" "}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function CommunityPosts() {
  const [sort, setSort] = useState<"hot" | "new">("hot");
  const [posts, setPosts] = useState(communityHighlights);
  const [mode, setMode] = useState<"live" | "highlights">("highlights");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setPosts(communityHighlights);
    setMode("highlights");
    fetch("/api/community-posts?sort=" + sort, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Feed unavailable");
        return response.json();
      })
      .then((result) => {
        setPosts(result.posts);
        setMode(result.mode);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPosts(communityHighlights);
          setMode("highlights");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [sort]);
  return (
    <section aria-labelledby="community-posts-title" className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2
            id="community-posts-title"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            From the community
          </h2>
          <p className="mt-3 max-w-prose text-muted-foreground">
            The conversations, experiences and practical tips behind the rides.
          </p>
        </div>
        <div
          role="group"
          aria-label="Community post order"
          className="flex gap-2"
        >
          <Button
            variant={sort === "hot" ? "secondary" : "outline"}
            aria-pressed={sort === "hot"}
            onClick={() => setSort("hot")}
          >
            Trending
          </Button>
          <Button
            variant={sort === "new" ? "secondary" : "outline"}
            aria-pressed={sort === "new"}
            onClick={() => setSort("new")}
          >
            Newest
          </Button>
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="my-6 text-sm text-muted-foreground"
      >
        {loading
          ? "Checking Reddit. Selected highlights are shown while we wait."
          : mode === "live"
            ? sort === "hot"
              ? "Trending posts from Reddit."
              : "Newest posts from Reddit."
            : "Reddit’s live feed is unavailable. Showing selected community highlights instead."}
      </p>
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
        {posts[0] && <Post key={posts[0].id} post={posts[0]} featured />}
        <div>
          {posts.slice(1).map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
