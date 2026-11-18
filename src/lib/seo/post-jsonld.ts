import {
  siteName,
  siteOrigin,
} from "../siteMetadata.ts";
import type { PostRow } from "../posts/repository.ts";

const WORDS_PER_MINUTE = 220;

function isoDuration(minutes: number): string {
  return `PT${Math.max(1, minutes)}M`;
}

/**
 * Only fields the visible page actually shows are emitted. There is no
 * aggregateRating, no fake interactionStatistic and no invented award.
 */
export function blogPostingJsonLd(post: PostRow): Record<string, unknown> {
  const url = `${siteOrigin}/posts/${post.slug}`;
  const words = post.bodyMd.trim() ? post.bodyMd.trim().split(/\s+/).length : 0;
  const author = post.author;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title.slice(0, 110),
    description: post.summary,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    wordCount: words,
    timeRequired: isoDuration(Math.round(words / WORDS_PER_MINUTE)),
    keywords: post.tags.join(", "),
    ...(post.coverImageUrl ? { image: [post.coverImageUrl] } : {}),
    author: author
      ? {
          "@type": "Person",
          name: author.displayName,
          url: `${siteOrigin}/writers/${author.handle}`,
          ...(author.avatarUrl ? { image: author.avatarUrl } : {}),
        }
      : { "@type": "Organization", name: siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteOrigin,
      logo: {
        "@type": "ImageObject",
        url: `${siteOrigin}/logo-max-res.jpeg`,
      },
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteOrigin}${item.path}`,
    })),
  };
}

/** React-safe serialisation: `<` is escaped so content cannot close the tag. */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
