import Image from "next/image";

import type { Post } from "@/data/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article
      data-reveal=""
      className="flex flex-col overflow-hidden rounded-card border border-line bg-bg2 transition-transform duration-350 hover:-translate-y-1.5"
    >
      <div className="relative aspect-16/10">
        <Image
          src={post.src}
          alt={post.alt}
          fill
          sizes="(max-width: 860px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5.5">
        <div className="text-xs font-bold tracking-[0.14em] text-acc uppercase">
          {post.tag} · {post.read}
        </div>
        <h3 className="font-display m-0 text-[19px] leading-snug font-bold tracking-[-0.02em]">
          {post.title}
        </h3>
        <p className="m-0 text-[15px] leading-relaxed text-fg2">
          {post.excerpt}
        </p>
        <div className="mt-auto pt-3 text-[13px] text-fg2">
          {post.by} · {post.date}
        </div>
      </div>
    </article>
  );
}
