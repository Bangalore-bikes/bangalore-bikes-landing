import type { MetadataRoute } from "next";

import { wikiGuides } from "@/data/wiki";
import { getArticles, getRides } from "@/lib/content-source";
import {
  isPreviewDeployment,
  publicPages,
  siteOrigin,
} from "@/lib/siteMetadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment) return [];
  const [articles, rides] = await Promise.all([getArticles(), getRides()]);
  const pages = Object.entries(publicPages)
    .filter(([path, page]) =>
      path === "/blogs"
        ? articles.length > 0
        : path === "/rides"
          ? rides.length > 0
          : page.index,
    )
    .map(([path]) => ({ url: siteOrigin + path }));
  return [
    ...pages,
    ...wikiGuides.map((guide) => ({ url: siteOrigin + "/wiki/" + guide.slug })),
    ...articles.map((article) => ({
      url: siteOrigin + "/blogs/" + article.slug,
      lastModified: article.updatedAt,
    })),
    ...rides
      .filter((ride) => ride.status !== "cancelled")
      .map((ride) => ({
        url: siteOrigin + "/rides/" + ride.slug,
        lastModified: ride.updatedAt,
      })),
  ];
}
