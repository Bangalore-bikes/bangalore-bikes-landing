import { ArticleList } from "@/components/common/article-list";
import { getArticles } from "@/lib/content-source";

export async function LatestArticles() {
  const articles = await getArticles();
  if (articles.length === 0) return null;
  return (
    <section aria-labelledby="latest-articles-title" className="py-10">
      <h2
        id="latest-articles-title"
        className="mb-6 text-2xl font-bold sm:text-3xl"
      >
        Community stories
      </h2>
      <ArticleList articles={articles.slice(0, 3)} headingLevel={3} />
    </section>
  );
}
