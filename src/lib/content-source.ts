import { articles as staticArticles } from "@/data/articles";
import { communityResources as staticResources } from "@/data/community-resources";
import { rides as staticRides } from "@/data/rides";

import { articleSchema, type CommunityArticle } from "./articleSchema";
import { hasDatabaseConfig, getContentStore } from "./db";
import { resourceSchema, type CommunityResource } from "./resourceSchema";
import { rideSchema, type Ride } from "./rideSchema";

/**
 * Public content source. When a managed database is configured it is the
 * source of truth; otherwise the validated repository JSON is used. A database
 * failure falls back to the repository so the public site stays available.
 */
async function readPublished<T>(
  collection: "articles" | "rides" | "resources",
): Promise<T[] | null> {
  if (!hasDatabaseConfig()) return null;
  try {
    const records = await getContentStore().list<T>(collection, "published");
    return records.map((record) => record.data);
  } catch (error) {
    console.error(
      `Managed content read failed for ${collection}; serving repository JSON instead.`,
      error,
    );
    return null;
  }
}

function valid<T>(
  items: T[],
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
): T[] {
  return items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function getArticles(): Promise<CommunityArticle[]> {
  const records = await readPublished<CommunityArticle>("articles");
  if (!records) return staticArticles;
  return valid(records, articleSchema).sort(
    (a, b) =>
      Date.parse(b.publishedAt ?? b.updatedAt) -
      Date.parse(a.publishedAt ?? a.updatedAt),
  );
}

export async function getRides(): Promise<Ride[]> {
  const records = await readPublished<Ride>("rides");
  if (!records) return staticRides;
  return valid(records, rideSchema);
}

export async function getCommunityResources(): Promise<CommunityResource[]> {
  const records = await readPublished<CommunityResource>("resources");
  if (!records) return staticResources;
  return valid(records, resourceSchema);
}
