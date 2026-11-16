import type { MetadataRoute } from "next";
import { rides } from "@/data/rides";
import { articles } from "@/data/articles";
import {
  isPreviewDeployment,
  publicPages,
  siteOrigin,
} from "@/lib/siteMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPreviewDeployment) return [];
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
