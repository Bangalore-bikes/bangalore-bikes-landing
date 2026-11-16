export { default } from "../_blogs/page";
import { createPageMetadata } from "@/lib/siteMetadata";
import { articles } from "@/data/articles";

export const metadata = createPageMetadata("/blogs", {
  index: articles.length > 0,
});
