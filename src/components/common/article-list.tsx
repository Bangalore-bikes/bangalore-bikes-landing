import Link from "next/link";
import type { CommunityArticle } from "@/lib/articleSchema";

export function ArticleList({
  articles,
  headingLevel = 2,
}: {
  articles: readonly CommunityArticle[];
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <ul className="divide-y divide-border">
      {articles.map((article) => (
        <li key={article.slug} className="space-y-3 py-6 first:pt-0">
          <Heading className="text-2xl font-semibold">
            <Link
              className="underline underline-offset-4"
              href={"/blogs/" + article.slug}
            >
              {article.title}
            </Link>
          </Heading>
          <p className="max-w-prose leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
          <p className="text-sm text-muted-foreground">
            By {article.author} ·{" "}
            <time dateTime={article.publishedAt ?? article.updatedAt}>
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeZone: "Asia/Kolkata",
              }).format(new Date(article.publishedAt ?? article.updatedAt))}
            </time>
          </p>
        </li>
      ))}
    </ul>
  );
}
