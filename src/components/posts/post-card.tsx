import Link from "next/link";

import { formatDate, readingMinutes, tagLabel } from "@/lib/posts/format";
import type { PostRow } from "@/lib/posts/repository";

/**
 * The card is deliberately plain: cover, title, what it is about, and who
 * wrote it. A reader should be able to decide in one glance.
 */
export function PostCard({ post, priority = false }: { post: PostRow; priority?: boolean }) {
  const author = post.author;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card lift transition-shadow duration-300 hover:shadow-lg">
      <Link
        href={`/posts/${post.slug}`}
        className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {post.coverImageUrl ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
            {/* Covers are arbitrary author-hosted URLs, not Next-optimised assets. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              width={960}
              height={540}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950" />
        )}

        <div className="flex flex-1 flex-col gap-3 p-5">
          {post.tags.length > 0 && (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-muted-foreground">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag}>{tagLabel(tag)}</span>
              ))}
            </p>
          )}
          <h2 className="text-xl font-semibold leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
          <p className="mt-auto pt-2 text-xs text-muted-foreground">
            {author ? author.displayName : "Bangalore Bikes"} ·{" "}
            {formatDate(post.publishedAt ?? post.updatedAt)} · {readingMinutes(post.bodyMd)} min
            read
          </p>
        </div>
      </Link>
    </article>
  );
}
