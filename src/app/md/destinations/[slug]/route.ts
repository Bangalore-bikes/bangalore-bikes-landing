import { notFound } from "next/navigation";

import { destinationArchive } from "@/data/wiki";
import { destinationSlugIndex } from "@/lib/destinations";
import {
  destinationCanonical,
  destinationMarkdown,
} from "@/lib/seo/content-mirrors";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";

export const dynamic = "force-static";
export const dynamicParams = false;

const rows = destinationArchive.rows;
const slugs = destinationSlugIndex(rows);
const bySlug = new Map(rows.map((row) => [slugs[row.id], row]));

export function generateStaticParams() {
  if (isPreviewDeployment) return [];
  return Object.values(slugs).map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const destination = bySlug.get(slug);
  if (!destination) notFound();

  return new Response(
    destinationMarkdown(destination, slug, { origin: siteOrigin }),
    {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        link: `<${destinationCanonical(slug, siteOrigin)}>; rel="canonical"`,
        "x-robots-tag": "noindex, follow",
        "cache-control": "public, max-age=0, s-maxage=86400",
      },
    },
  );
}
