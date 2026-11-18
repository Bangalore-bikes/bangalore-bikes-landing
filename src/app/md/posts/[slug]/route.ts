import { notFound } from "next/navigation";

import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { postCanonical, postMarkdown } from "@/lib/seo/content-mirrors";
import { getPostBySlug } from "@/lib/posts/repository";
import { siteOrigin } from "@/lib/siteMetadata";

export const revalidate = 60;
export const dynamicParams = true;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!hasDatabaseConfig()) notFound();

  let post = null;
  try {
    post = await getPostBySlug(getPostsClient(), slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  return new Response(postMarkdown(post, { origin: siteOrigin }), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      link: `<${postCanonical(post.slug, siteOrigin)}>; rel="canonical"`,
      "x-robots-tag": "noindex, follow",
      "cache-control": "public, max-age=0, s-maxage=60",
    },
  });
}
