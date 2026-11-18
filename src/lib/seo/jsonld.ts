import { communityLinks } from "../community.ts";
import { siteName, siteOrigin } from "../siteMetadata.ts";
import type { Destination } from "../wiki.ts";
import type { WikiGuide } from "../wiki.ts";

export { breadcrumbJsonLd, jsonLdScript } from "./post-jsonld.ts";

export const ORGANIZATION_ID = `${siteOrigin}/#organization`;
export const WEBSITE_ID = `${siteOrigin}/#website`;

const WORDS_PER_MINUTE = 220;

function wordsIn(guide: Pick<WikiGuide, "sections">): number {
  return guide.sections.reduce(
    (total, section) =>
      total +
      [...section.paragraphs, ...section.items].join(" ").trim().split(/\s+/)
        .length,
    0,
  );
}

/**
 * The community itself is the publisher. `sameAs` lists only profiles the site
 * already links to, so the entity graph can be verified by a reader.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteName,
    alternateName: "r/BangaloreBikes",
    url: siteOrigin,
    description:
      "A community for motorcycle riders in Bengaluru: the r/BangaloreBikes handbook, destination records, maintenance notes and rider posts.",
    logo: {
      "@type": "ImageObject",
      url: `${siteOrigin}/logo-max-res.jpeg`,
    },
    areaServed: {
      "@type": "City",
      name: "Bengaluru",
      containedInPlace: { "@type": "State", name: "Karnataka" },
    },
    sameAs: [communityLinks.subreddit, communityLinks.whatsapp],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteName,
    url: siteOrigin,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Wiki guides are attributed adaptations of community sources, so the
 * organisation is the author. Nothing here claims a named person wrote them.
 */
export function guideArticleJsonLd(
  guide: Pick<WikiGuide, "slug" | "title" | "summary" | "sections">,
  options: { dateModified?: string } = {},
): Record<string, unknown> {
  const url = `${siteOrigin}/wiki/${guide.slug}`;
  const words = wordsIn(guide);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: guide.title.slice(0, 110),
    description: guide.summary,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    isPartOf: { "@id": WEBSITE_ID },
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    wordCount: words,
    timeRequired: `PT${Math.max(1, Math.round(words / WORDS_PER_MINUTE))}M`,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * A destination page describes a real place the community recorded. No rating,
 * no review and no coordinates: the source has none, and a maps link is not a
 * substitute for a geocode.
 */
export function destinationJsonLd(
  destination: Destination,
  options: { url: string; description: string; kindLabel: string },
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `${options.url}#place`,
    name: destination.name,
    description: options.description,
    url: options.url,
    touristType: options.kindLabel,
    address: {
      "@type": "PostalAddress",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    isPartOf: { "@id": WEBSITE_ID },
    ...(destination.distanceKm
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Distance from Bengaluru as recorded in 2010",
            value: destination.distanceKm,
            unitCode: "KMT",
          },
        }
      : {}),
  };
}

/**
 * Only used where the page visibly lists links to those same URLs, so the
 * markup describes the page rather than an imagined catalogue.
 */export function itemListJsonLd(options: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteOrigin}${options.path}#items`,
    name: options.name,
    numberOfItems: options.items.length,
    itemListElement: options.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${siteOrigin}${item.path}`,
    })),
  };
}
