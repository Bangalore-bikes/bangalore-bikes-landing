import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostBody } from "@/components/posts/post-body";
import { PostCard } from "@/components/posts/post-card";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { formatDate, readingMinutes, tagLabel } from "@/lib/posts/format";
import { getPostBySlug, listPublished } from "@/lib/posts/repository";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from "@/lib/seo/post-jsonld";
import { isPreviewDeployment, siteName, siteOrigin } from "@/lib/siteMetadata";

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!hasDatabaseConfig()) return [];
  try {
    const posts = await listPublished(getPostsClient(), { limit: 100 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!hasDatabaseConfig()) return { title: "Post not found", robots: { index: false } };

  let post = null;
  try {
    post = await getPostBySlug(getPostsClient(), slug);
  } catch {
    post = null;
  }
  if (!post) return { title: "Post not found", robots: { index: false } };

  const url = `${siteOrigin}/posts/${post.slug}`;
  const image = post.coverImageUrl ?? `${siteOrigin}/hero-banner.png`;
  return {
    title: post.title,
    description: post.summary.slice(0, 160),
    alternates: { canonical: url },
    authors: post.author ? [{ name: post.author.displayName }] : undefined,
    robots: { index: !isPreviewDeployment, follow: true },
    openGraph: {
      type: "article",
      siteName,
      title: post.title,
      description: post.summary,
      url,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.displayName] : undefined,
      tags: post.tags,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [image],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  if (!hasDatabaseConfig()) notFound();

  const client = getPostsClient();
  const post = await getPostBySlug(client, slug);
  if (!post) notFound();

  const related = (await listPublished(client, { limit: 4 })).filter(
    (entry) => entry.id !== post.id,
  ).slice(0, 3);

  const author = post.author;
  const published = formatDate(post.publishedAt ?? post.updatedAt);
  const updated = formatDate(post.updatedAt);
  const showUpdated = post.updatedAt.slice(0, 10) !== (post.publishedAt ?? "").slice(0, 10);

  return (
    <main className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            blogPostingJsonLd(post),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Rider posts", path: "/posts" },
              { name: post.title, path: `/posts/${post.slug}` },
            ]),
          ]),
        }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link className="underline-offset-4 hover:underline" href="/posts">
          Rider posts
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{post.title}</span>
      </nav>

      <article className="mt-6 space-y-8">
        <header className="space-y-5">
          {post.tags.length > 0 && (
            <p className="flex flex-wrap gap-x-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {post.tags.map((tag) => (
                <Link key={tag} className="hover:underline" href={`/posts?tag=${tag}`}>
                  {tagLabel(tag)}
                </Link>
              ))}
            </p>
          )}
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground">
            {post.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {author && (
              <Link className="font-medium text-foreground hover:underline" href={`/writers/${author.handle}`}>
                {author.displayName}
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt ?? post.updatedAt}>Published {published}</time>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(post.bodyMd)} min read</span>
            {showUpdated && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.updatedAt}>Updated {updated}</time>
              </>
            )}
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="rounded-lg border-l-2 border-dixie-500 bg-muted/40 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            In short
          </p>
          <p className="mt-1 leading-relaxed">{post.summary}</p>
        </div>

        <PostBody html={post.bodyHtml ?? ""} />

        {author && (
          <aside className="mt-12 flex flex-wrap items-start gap-4 rounded-xl border bg-card p-6">
            {author.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            )}
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Written by</p>
              <Link className="text-lg font-medium hover:underline" href={`/writers/${author.handle}`}>
                {author.displayName}
              </Link>
              <p className="text-sm text-muted-foreground">
                {author.trustLevel >= 1
                  ? "A trusted contributor to Bangalore Bikes."
                  : "A rider in the Bangalore Bikes community."}
              </p>
            </div>
          </aside>
        )}

        {related.length > 0 && (
          <section className="space-y-4 pt-6">
            <h2 className="text-2xl font-semibold tracking-tight">Keep reading</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry) => (
                <li key={entry.id}>
                  <PostCard post={entry} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
