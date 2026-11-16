import { CommunityPage } from "@/components/common/community-page";
import { articles } from "@/data/articles";
import { ArticleList } from "@/components/common/article-list";

export default function BlogsPage() {
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
