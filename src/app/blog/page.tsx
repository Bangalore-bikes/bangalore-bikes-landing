import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/common/section";
import { POSTS } from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories, guides and ride reports from the r/bangalorebikes community.",
};

export default function BlogPage() {
  return (
    <Container className="pt-20 pb-25">
      <PageHeader eyebrow="Stories · guides · ride reports">
        From the
        <br />
        saddle.
      </PageHeader>

      <div className="mt-12 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </Container>
  );
}
