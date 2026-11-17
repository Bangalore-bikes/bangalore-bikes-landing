import { ArticleList } from "@/components/common/article-list";
import { CommunityPage } from "@/components/common/community-page";
import { getArticles } from "@/lib/content-source";

export default async function BlogsPage() {
  const articles = await getArticles();
  return (
    <CommunityPage
      title="Community stories"
      description={
        articles.length
          ? "Stories and guides shared with author permission by the Bangalore Bikes community."
          : "No articles have been published on this website yet. Read ride reports and join conversations on r/BangaloreBikes."
      }
      actionLabel="Read discussions on Reddit"
    >
      {articles.length > 0 && <ArticleList articles={articles} />}
    </CommunityPage>
  );
}
