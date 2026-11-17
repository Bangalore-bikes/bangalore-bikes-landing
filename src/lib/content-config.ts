import type { ZodType } from "zod";

import { articleSchema, type CommunityArticle } from "./articleSchema.ts";
import {
  collectionNames,
  isCollectionName,
  type CollectionName,
} from "./content-meta.ts";
import { resourceSchema, type CommunityResource } from "./resourceSchema.ts";
import { rideSchema, type Ride } from "./rideSchema.ts";

export { collectionNames, isCollectionName };
export type { CollectionName };

export type ContentRecord = CommunityArticle | Ride | CommunityResource;

type Config = {
  idField: "slug" | "id";
  schema: ZodType<ContentRecord>;
  publicPaths: string[];
};

const collections: Record<CollectionName, Config> = {
  articles: {
    idField: "slug",
    schema: articleSchema as ZodType<ContentRecord>,
    publicPaths: ["/", "/blogs"],
  },
  rides: {
    idField: "slug",
    schema: rideSchema as ZodType<ContentRecord>,
    publicPaths: ["/", "/rides"],
  },
  resources: {
    idField: "id",
    schema: resourceSchema as ZodType<ContentRecord>,
    publicPaths: ["/", "/wiki", "/maintenance/garages"],
  },
};

export function collectionIdField(collection: CollectionName) {
  return collections[collection].idField;
}

export function publicPathsFor(collection: CollectionName, id: string) {
  const paths = ["/", "/sitemap.xml", ...collections[collection].publicPaths];
  if (collection === "articles") paths.push(`/blogs/${id}`);
  if (collection === "rides") paths.push(`/rides/${id}`);
  return paths;
}

export type RecordValidation =
  | {
      ok: true;
      id: string;
      data: ContentRecord;
      published: boolean;
    }
  | { ok: false; message: string; issues: string[] };

/**
 * Validates a stored record with the same schema used by the public loaders.
 * For articles and resources visibility follows `status`; a moderator may hide
 * a published record but cannot publish a draft. Rides default to visible.
 */
export function validateRecord(
  collection: CollectionName,
  input: unknown,
  publishedOverride?: boolean,
): RecordValidation {
  const config = collections[collection];
  const parsed = config.schema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    return {
      ok: false,
      message: "Record does not match the content schema",
      issues,
    };
  }

  const data = parsed.data;
  const defaultsToPublished =
    collection === "rides"
      ? true
      : (data as CommunityArticle | CommunityResource).status === "published";
  const published = publishedOverride ?? defaultsToPublished;

  if (
    publishedOverride === true &&
    collection !== "rides" &&
    (data as CommunityArticle | CommunityResource).status !== "published"
  ) {
    return {
      ok: false,
      message: "A draft cannot be made public",
      issues: ["status: set status to published before making it public"],
    };
  }

  const id = String((data as Record<string, unknown>)[config.idField]);
  return { ok: true, id, data, published };
}

export function recordIdOf(
  collection: CollectionName,
  data: unknown,
): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = (data as Record<string, unknown>)[
    collections[collection].idField
  ];
  return typeof value === "string" ? value : null;
}
