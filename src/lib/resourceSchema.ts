import { z } from "zod";

const sourceUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        !url.port &&
        ["reddit.com", "www.reddit.com"].includes(url.hostname) &&
        /^\/r\/bangalorebikes\/comments\/[a-z0-9]+(?:\/|$)/i.test(
          url.pathname,
        ) &&
        [...value].every(
          (char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127,
        )
      );
    } catch {
      return false;
    }
  }, "Use an HTTPS link to an original r/BangaloreBikes post");

export const resourceSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1).max(180),
    category: z.enum([
      "Community",
      "Maintenance",
      "Destinations",
      "Beginner",
      "Transport",
    ]),
    summary: z.string().trim().min(1).max(600),
    url: sourceUrl,
    sourceLabel: z.enum([
      "Community notice on r/BangaloreBikes",
      "Member discussion on r/BangaloreBikes",
    ]),
    sourceCheckedOn: z.string().date(),
    status: z.enum(["draft", "published"]),
  })
  .strict();

export type CommunityResource = z.infer<typeof resourceSchema>;

export function parseResourceCollection(input: unknown): CommunityResource[] {
  const resources = z.array(resourceSchema).parse(input);
  if (new Set(resources.map((item) => item.id)).size !== resources.length) {
    throw new Error("Resource IDs must be unique");
  }
  const postIds = resources.map((item) =>
    new URL(item.url).pathname.split("/")[4].toLowerCase(),
  );
  if (new Set(postIds).size !== resources.length) {
    throw new Error("Each Reddit post may appear only once");
  }
  return resources;
}

export function publishedResources(input: unknown) {
  return parseResourceCollection(input).filter(
    (resource) => resource.status === "published",
  );
}
