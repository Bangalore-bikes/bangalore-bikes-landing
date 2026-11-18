import type { Metadata } from "next";

/**
 * Canonical origin for URLs the site emits itself (sitemap, robots, JSON-LD,
 * Open Graph, RSS). It follows NEXT_PUBLIC_SITE_URL so a deployment never
 * advertises a host that is not serving this site; the apex domain is only the
 * fallback for local builds without the variable.
 */
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://bangalorebikes.com";
export const siteName = "Bangalore Bikes";

export const publicPages = {
  "/": {
    title: "Bangalore Bikes — Bengaluru motorcycle community",
    description:
      "A community home for r/BangaloreBikes. Find Reddit discussions, community resources, and information for motorcycle riders across Bengaluru.",
    index: true,
  },
  "/wiki": {
    title: "Community handbook",
    description:
      "Read Bangalore Bikes guides on group rides, community rules, privacy and emergency help. Explore the native destination collection from the community wiki.",
    index: true,
  },
  "/contact": {
    title: "Contact the moderators",
    description:
      "Contact the r/BangaloreBikes moderators through Reddit modmail for community questions, website corrections, and resource suggestions.",
    index: true,
  },
  "/join": {
    title: "Join Bangalore Bikes",
    description:
      "Join the Bangalore Bikes community through Reddit or the WhatsApp group. Scan the invitation QR code, download it, or open the invite on your phone.",
    index: true,
  },
  "/rides": {
    title: "Community rides",
    description:
      "Browse community ride plans, check dates and meeting points, and follow the original r/BangaloreBikes discussions for updates.",
    index: false,
  },
  "/blogs": {
    title: "Community stories",
    description:
      "Stories, ride reports, and conversations from the Bangalore Bikes motorcycle community.",
    index: false,
  },
  "/posts": {
    title: "Rider posts",
    description:
      "Ride reports, routes and workshop notes written by Bangalore Bikes riders, covering the roads, the seasons and the repairs that mattered.",
    index: true,
  },
  "/destinations": {
    title: "Riding destinations near Bengaluru",
    description:
      "Day-ride destinations around Bengaluru from the community wiki: search hills, waterfalls and heritage sites by name and listed distance.",
    index: true,
  },
  "/maintenance": {
    title: "Motorcycle maintenance",
    description:
      "Prepare for a workshop visit, read an attributed community service experience, and find native ride-preparation and emergency-help guides.",
    index: true,
  },
  "/maintenance/garages": {
    title: "Workshop experiences",
    description:
      "Read a source-attributed Bangalore Bikes member report about PFB Customs and questions to ask before booking a workshop visit.",
    index: true,
  },
  "/maintenance/sos": {
    title: "Roadside help information",
    description:
      "Understand where to look for roadside help. Bangalore Bikes does not operate an emergency hotline or roadside-assistance service.",
    index: false,
  },
} as const;

// Netlify preview and branch builds must not compete with production in search.
export const isPreviewDeployment =
  process.env.CONTEXT === "deploy-preview" ||
  process.env.CONTEXT === "branch-deploy";

export function createPageMetadata(
  path: keyof typeof publicPages,
  options: { index?: boolean } = {},
): Metadata {
  const page = publicPages[path];
  const title = path === "/" ? page.title : page.title + " | " + siteName;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: siteOrigin + path },
    robots: {
      index: (options.index ?? page.index) && !isPreviewDeployment,
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description: page.description,
      url: siteOrigin + path,
      images: [
        {
          url: siteOrigin + "/hero-banner.png",
          alt: "Bangalore Bikes motorcycle community",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [siteOrigin + "/hero-banner.png"],
    },
  };
}
