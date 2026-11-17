import { XMLParser, XMLValidator } from "fast-xml-parser";

export type CommunityPost = {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedAt?: string;
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export function parseRedditFeed(xml: string): CommunityPost[] {
  if (
    xml.length > 1_000_000 ||
    /<!\s*(?:DOCTYPE|ENTITY)/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("Invalid community feed");
  const document = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    processEntities: true,
  }).parse(xml);
  if (!document.feed || typeof document.feed !== "object")
    throw new Error("Not an Atom feed");
  const entries = document.feed.entry
    ? Array.isArray(document.feed.entry)
      ? document.feed.entry
      : [document.feed.entry]
    : [];
  const posts: CommunityPost[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    const date = entry.published ?? entry.updated;
    if (
      !title ||
      title.length > 300 ||
      /\bnsfw\b/i.test(title) ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(date) ||
      !Number.isFinite(Date.parse(date))
    )
      continue;
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    for (const link of links) {
      const href = link?.["@_href"];
      if (
        typeof href !== "string" ||
        [...href].some(
          (char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127,
        )
      )
        continue;
      try {
        const url = new URL(href);
        const match = url.pathname.match(
          /^\/r\/bangalorebikes\/comments\/([a-z0-9]+)(?:\/|$)/i,
        );
        if (
          url.protocol !== "https:" ||
          url.username ||
          url.password ||
          url.port ||
          !["www.reddit.com", "reddit.com"].includes(url.hostname) ||
          !match
        )
          continue;
        const id = match[1].toLowerCase();
        if (seen.has(id)) break;
        url.search = "";
        url.hash = "";
        const rawAuthor = entry.author?.name;
        const author =
          typeof rawAuthor === "string"
            ? rawAuthor.replace(/^\/?u\//, "")
            : undefined;
        posts.push({
          id,
          title,
          url: url.toString(),
          ...(author ? { author } : {}),
          publishedAt: new Date(date).toISOString(),
        });
        seen.add(id);
        break;
      } catch {
        /* Ignore malformed upstream links, not the rest of the feed. */
      }
    }
    if (posts.length === 6) break;
  }
  return posts;
}
