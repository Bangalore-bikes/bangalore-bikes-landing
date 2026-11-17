import type { MetadataRoute } from "next";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";

/**
 * AI crawlers are explicitly allowed: answer engines are a distribution
 * channel the community wants, and the content is already public. Private
 * surfaces are closed to everything.
 */
const PRIVATE = [
  "/admin",
  "/api/",
  "/moderation",
  "/write",
  "/drafts",
  "/login",
  "/signup",
  "/reset",
  "/verify",
];

const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "CCBot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_AGENTS.map((agent) => ({ userAgent: agent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: siteOrigin + "/sitemap.xml",
    host: siteOrigin,
  };
}
