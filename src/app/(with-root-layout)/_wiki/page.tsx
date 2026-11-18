import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { ResourceDirectory } from "@/components/common/resource-directory";
import { WikiDirectory } from "@/components/wiki/wiki-directory";
import { destinationArchive, wikiGuides } from "@/data/wiki";
import { getCommunityResources } from "@/lib/content-source";
import { itemListJsonLd, jsonLdScript } from "@/lib/seo/jsonld";

export const revalidate = 60;

export default async function WikiPage() {
  const communityResources = await getCommunityResources();
  return (
    <main className="mx-auto w-full max-w-6xl space-y-14 px-2 py-10 sm:space-y-20 sm:px-0 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            itemListJsonLd({
              name: "Bangalore Bikes community handbook",
              path: "/wiki",
              items: wikiGuides.map((guide) => ({
                name: guide.title,
                path: `/wiki/${guide.slug}`,
              })),
            }),
          ),
        }}
      />
      <header className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            The Bengaluru rider’s handbook.
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted-foreground">
            Our community knowledge, here to read. Get ready for your first
            group ride, understand the community, and find somewhere new to
            explore.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Adapted from r/BangaloreBikes community sources, with original
            references on every guide.
          </p>
        </div>
        <Link
          href="/destinations"
          className="group rounded-xl bg-secondary p-7 text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <MapPinned className="size-7" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Where shall we ride?</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Browse {destinationArchive.rows.length} historical destination
            records from the wiki. Search hills, waterfalls, heritage sites and
            more.
          </p>
          <span className="mt-6 flex items-center gap-3 font-medium group-hover:underline">
            Explore destinations{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </header>
      <WikiDirectory guides={wikiGuides} />
      <section
        className="border-t border-border pt-10"
        aria-labelledby="reddit-resources-title"
      >
        <h2 id="reddit-resources-title" className="text-2xl font-semibold">
          From the community
        </h2>
        <p className="mt-3 mb-8 max-w-prose leading-relaxed text-muted-foreground">
          Want the discussion behind a guide? These original notices and member
          experiences add context.
        </p>
        <ResourceDirectory entries={communityResources} />
      </section>
    </main>
  );
}
