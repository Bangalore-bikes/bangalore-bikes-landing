import type { MetadataRoute } from "next";

import { destinationArchive, wikiGuides } from "@/data/wiki";
import {
  destinationIsIndexable,
  destinationPath,
  destinationSlugIndex,
} from "@/lib/destinations";
import { getArticles, getRides } from "@/lib/content-source";
import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { listPublished, type PostRow } from "@/lib/posts/repository";
import {
  isPreviewDeployment,
  publicPages,
  siteOrigin,
} from "@/lib/siteMetadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment) return [];
  const [articles, rides] = await Promise.all([getArticles(), getRides()]);

  // The community database is optional; an unconfigured deployment simply has
  // no rider posts to list.
  const posts: PostRow[] = [];
  if (hasDatabaseConfig()) {
    try {
      const client = getPostsClient();
      for (let offset = 0; ; offset += 100) {
        const page = await listPublished(client, { limit: 100, offset });
        posts.push(...page);
        if (page.length < 100) break;
      }
    } catch {
      posts.length = 0;
    }
  }
  const writers = [
    ...new Set(posts.map((post) => post.author?.handle).filter(Boolean)),
  ];
  const slugs = destinationSlugIndex(destinationArchive.rows);

  const pages = Object.entries(publicPages)
    .filter(([path, page]) =>
      path === "/blogs"
        ? articles.length > 0
        : path === "/rides"
          ? rides.length > 0
          : path === "/posts"
            ? posts.length > 0
            : page.index,
    )
    .map(([path]) => ({ url: siteOrigin + path }));
  return [
    ...pages,
    ...wikiGuides.map((guide) => ({ url: siteOrigin + "/wiki/" + guide.slug })),
    ...destinationArchive.rows
      .filter(destinationIsIndexable)
      .map((row) => ({
        url: siteOrigin + destinationPath(slugs[row.id]),
      })),
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
    ...posts.map((post) => ({
      url: siteOrigin + "/posts/" + post.slug,
      lastModified: post.updatedAt,
    })),
    ...writers.map((handle) => ({ url: siteOrigin + "/writers/" + handle })),
  ];
}
