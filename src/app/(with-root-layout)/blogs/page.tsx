export { default } from "../_blogs/page";
import { createPageMetadata } from "@/lib/siteMetadata";
import { getArticles } from "@/lib/content-source";

export const revalidate = 60;

export async function generateMetadata() {
  const articles = await getArticles();
  return createPageMetadata("/blogs", { index: articles.length > 0 });
}
