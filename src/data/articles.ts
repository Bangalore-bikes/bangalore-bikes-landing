import content from "./articles.json";
import { publishedArticles } from "@/lib/articleSchema";

// Drafts are excluded before data reaches public pages or browser props.
export const articles = publishedArticles(content);
