import { wikiGuides } from "@/data/wiki";
import { llmsTxt } from "@/lib/seo/content-mirrors";
import { siteOrigin } from "@/lib/siteMetadata";

/**
 * A discovery file for language models. Generated from the same guide data the
 * pages render, so it cannot advertise a page that no longer exists.
 */
export const revalidate = 3600;

export function GET() {
  return new Response(
    llmsTxt({
      origin: siteOrigin,
      guides: wikiGuides.map(({ slug, title, summary }) => ({
        slug,
        title,
        summary,
      })),
    }),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=3600",
      },
    },
  );
}
