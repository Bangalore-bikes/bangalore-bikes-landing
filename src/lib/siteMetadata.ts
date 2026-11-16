import type { Metadata } from "next";

export const siteOrigin = "https://bangalorebikes.com";
export const siteName = "Bangalore Bikes";

export const publicPages = {
  "/": {
    title: "Bangalore Bikes — Bengaluru motorcycle community",
    description:
      "A community home for r/BangaloreBikes. Find Reddit discussions, community resources, and information for motorcycle riders across Bengaluru.",
    index: true,
  },
  "/wiki": {
    title: "Community resources",
    description:
      "Explore source-linked r/BangaloreBikes community notices and rider experiences. Search the collection by topic or category.",
    index: true,
  },
  "/contact": {
    title: "Contact the moderators",
    description:
      "Contact the r/BangaloreBikes moderators through Reddit modmail for community questions, website corrections, and resource suggestions.",
    index: true,
  },
  "/rides": {
    title: "Community rides",
    description:
      "Find where to discuss rides with r/BangaloreBikes. No confirmed upcoming rides are currently listed on the website.",
    index: false,
  },
  "/blogs": {
    title: "Community stories",
    description:
      "Read ride reports and conversations on r/BangaloreBikes while the website's article collection is being prepared.",
    index: false,
  },
  "/destinations": {
    title: "Riding destinations",
    description:
      "Find destination discussions on r/BangaloreBikes while reviewed Bengaluru route guides are being prepared.",
    index: false,
  },
  "/maintenance": {
    title: "Motorcycle maintenance",
    description:
      "Maintenance discussions for all motorcycle brands, with links to garage and roadside-help information for the Bangalore Bikes community.",
    index: false,
  },
  "/maintenance/garages": {
    title: "Garage recommendations",
    description:
      "Ask r/BangaloreBikes about workshop experiences. No reviewed garage listings are currently published on the website.",
    index: false,
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

export function createPageMetadata(path: keyof typeof publicPages): Metadata {
  const page = publicPages[path];
  const title = path === "/" ? page.title : page.title + " | " + siteName;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: siteOrigin + path },
    robots: { index: page.index && !isPreviewDeployment, follow: true },
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
