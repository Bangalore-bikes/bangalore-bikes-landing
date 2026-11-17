import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/common/article-content";
import { getArticles } from "@/lib/content-source";
import { isPreviewDeployment, siteOrigin, siteName } from "@/lib/siteMetadata";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  const url = siteOrigin + "/blogs/" + article.slug;
  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author }],
    alternates: { canonical: url },
    robots: { index: !isPreviewDeployment, follow: true },
    openGraph: {
      type: "article",
      siteName,
      title: article.title,
      description: article.summary,
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: [siteOrigin + "/hero-banner.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [siteOrigin + "/hero-banner.png"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 py-12 sm:py-20">
      <Link className="underline underline-offset-4" href="/blogs">
        All community stories
      </Link>
      <article className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
          <p>By {article.author}</p>
          <p className="text-sm text-muted-foreground">
            Published{" "}
            <time dateTime={article.publishedAt}>
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "long",
                timeZone: "Asia/Kolkata",
              }).format(new Date(article.publishedAt ?? article.updatedAt))}
            </time>
          </p>
          {article.updatedAt !== article.publishedAt && (
            <p className="text-sm text-muted-foreground">
              Updated{" "}
              <time dateTime={article.updatedAt}>
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "long",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(article.updatedAt))}
              </time>
            </p>
          )}
        </header>
        <ArticleContent article={article} />
      </article>
    </main>
  );
}
