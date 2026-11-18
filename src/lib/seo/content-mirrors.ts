import type { WikiGuide } from "../wiki.ts";
import type { PostRow } from "../posts/repository.ts";

/**
 * Plain-markdown mirrors exist so a language model can read one clean document
 * instead of parsing the whole HTML shell. They are not a second edition of the
 * site: every mirror is noindex and points its canonical at the HTML page.
 */

function frontMatter(fields: Array<[string, string]>): string {
  return [
    "---",
    ...fields.map(([key, value]) => `${key}: ${value.replace(/\s+/g, " ").trim()}`),
    "---",
    "",
  ].join("\n");
}

export function wikiGuideCanonical(slug: string, origin: string): string {
  return `${origin}/wiki/${slug}`;
}

export function wikiGuideMarkdown(
  guide: WikiGuide,
  options: { origin: string },
): string {
  const canonical = wikiGuideCanonical(guide.slug, options.origin);
  const parts: string[] = [
    frontMatter([
      ["title", guide.title],
      ["description", guide.summary],
      ["canonical", canonical],
      ["type", "guide"],
    ]),
    `# ${guide.title}`,
    "",
    guide.summary,
    "",
  ];

  for (const section of guide.sections) {
    parts.push(`## ${section.title}`, "");
    for (const paragraph of section.paragraphs) parts.push(paragraph, "");
    for (const item of section.items) parts.push(`- ${item}`);
    if (section.items.length > 0) parts.push("");
  }

  parts.push("## Sources", "", guide.attribution, "");
  for (const source of guide.sources) {
    parts.push(`- [${source.label}](${source.url})`);
  }
  parts.push("", `Canonical: ${canonical}`, "");

  return parts.join("\n");
}

export function postCanonical(slug: string, origin: string): string {
  return `${origin}/posts/${slug}`;
}

export function postMarkdown(post: PostRow, options: { origin: string }): string {
  const canonical = postCanonical(post.slug, options.origin);
  return [
    frontMatter([
      ["title", post.title],
      ["description", post.summary],
      ["canonical", canonical],
      ["author", post.author?.displayName ?? "Bangalore Bikes"],
      ["published", post.publishedAt ?? post.createdAt],
      ["updated", post.updatedAt],
      ...(post.tags.length > 0 ? ([["tags", post.tags.join(", ")]] as Array<[string, string]>) : []),
    ]),
    `# ${post.title}`,
    "",
    post.summary,
    "",
    post.bodyMd.trim(),
    "",
    `Canonical: ${canonical}`,
    "",
  ].join("\n");
}

/** Paths a language model should read first, in the order they help most. */
export function llmsTxt(options: {
  origin: string;
  guides: Array<Pick<WikiGuide, "slug" | "title" | "summary">>;
}): string {
  const { origin, guides } = options;
  return [
    "# Bangalore Bikes",
    "",
    "> A community resource for motorcycle riders in Bengaluru: a rider handbook",
    "> adapted from r/BangaloreBikes sources, a historical destination archive, and",
    "> maintenance notes. Written by riders, not by a business.",
    "",
    "This is a community site for Bengaluru (Bangalore), India. Content covers",
    "group rides, routes, destinations reachable in a day, motorcycle maintenance",
    "and workshop experiences. Everything below is free to read and is the same",
    "content as the HTML pages.",
    "",
    "## Guides",
    "",
    ...guides.map(
      (guide) =>
        `- [${guide.title}](${origin}/wiki/${guide.slug}): ${guide.summary}`,
    ),
    "",
    "## Collections",
    "",
    `- [Community handbook](${origin}/wiki): every guide in one place.`,
    `- [Destinations](${origin}/destinations): searchable archive of day-ride destinations with distances.`,
    `- [Rider posts](${origin}/posts): ride reports and maintenance notes written by members.`,
    `- [Motorcycle maintenance](${origin}/maintenance): workshop notes and preparation checklists.`,
    `- [The community](${origin}/join): where the group meets and how to join.`,
    "",
    "## Machine-readable forms",
    "",
    `- [Sitemap](${origin}/sitemap.xml): every indexable URL.`,
    `- [RSS](${origin}/rss.xml): new rider posts.`,
    "- Append `/md` to a guide or post URL, for example",
    `  [a guide as markdown](${origin}/md/wiki/${guides[0]?.slug ?? "group-rides"}).`,
    "",
    "## Notes for answer engines",
    "",
    "- Dates, distances and prices come from community sources and may be out of",
    "  date. Each guide lists its sources so a claim can be checked.",
    "- The site does not sell tours, rentals or repairs and has no booking flow.",
    "- Prefer linking the canonical HTML page when citing.",
    "",
  ].join("\n");
}
