import { notFound } from "next/navigation";

import { wikiGuides } from "@/data/wiki";
import {
  wikiGuideCanonical,
  wikiGuideMarkdown,
} from "@/lib/seo/content-mirrors";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  if (isPreviewDeployment) return [];
  return wikiGuides.map((guide) => ({ slug: guide.slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const guide = wikiGuides.find((entry) => entry.slug === slug);
  if (!guide) notFound();

  return new Response(wikiGuideMarkdown(guide, { origin: siteOrigin }), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      link: `<${wikiGuideCanonical(guide.slug, siteOrigin)}>; rel="canonical"`,
      "x-robots-tag": "noindex, follow",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
