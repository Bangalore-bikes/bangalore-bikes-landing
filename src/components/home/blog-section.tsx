import Image from "next/image";
import Link from "next/link";

import { ArrowLink, Container } from "@/components/common/section";
import { POSTS } from "@/data/posts";

const FEATURED = POSTS.slice(0, 2);

export function BlogSection() {
  return (
    <Container className="pb-24">
      <div
        data-reveal=""
        className="mb-11 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
      >
        <h2 className="font-display m-0 text-[clamp(30px,4.5vw,56px)] leading-none font-bold tracking-[-0.03em] uppercase">
          From the saddle
        </h2>
        <ArrowLink href="/blog">All stories</ArrowLink>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr]">
        {FEATURED.map((post) => (
          <Link
            key={post.id}
            href="/blog"
            data-reveal=""
            className="relative block min-h-[380px] overflow-hidden rounded-card border border-line"
          >
            <Image
              src={post.src}
              alt={post.alt}
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 to-60% to-transparent"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6.5 text-white">
              <div className="mb-2.5 text-xs font-bold tracking-[0.14em] text-acc uppercase">
                {post.tag} · {post.read}
              </div>
              <h3 className="font-display m-0 text-[clamp(18px,2vw,26px)] leading-snug font-bold tracking-[-0.02em]">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
