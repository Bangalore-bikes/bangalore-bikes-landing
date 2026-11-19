import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { destinationArchive } from "@/data/wiki";
import {
  cleanDirection,
  destinationDays,
  destinationDescription,
  destinationIsIndexable,
  destinationKindLabel,
  destinationMonths,
  monthsInSeason,
  destinationPageTitle,
  destinationPath,
  destinationPlanningNotes,
  destinationSlugIndex,
  nearbyReferences,
  relatedDestinations,
} from "@/lib/destinations";
import { DestinationHighlights } from "@/components/destinations/destination-highlights";
import {
  breadcrumbJsonLd,
  destinationJsonLd,
  jsonLdScript,
} from "@/lib/seo/jsonld";
import { ogImageUrl } from "@/lib/seo/og";
import { isPreviewDeployment, siteName, siteOrigin } from "@/lib/siteMetadata";

type Props = { params: Promise<{ slug: string }> };

const rows = destinationArchive.rows;
const slugs = destinationSlugIndex(rows);
const bySlug = new Map(rows.map((row) => [slugs[row.id], row]));

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(slugs).map((slug) => ({ slug }));
}

function yesNo(value: string | undefined, recorded: string, missing: string) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "yes") return recorded;
  if (normalized === "no") return missing;
  return "Not recorded";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = bySlug.get(slug);
  if (!destination) {
    return { title: "Destination not found", robots: { index: false } };
  }
  const url = siteOrigin + destinationPath(slug);
  const title = destinationPageTitle(destination, slug);
  const description = destinationDescription(destination);
  const image = ogImageUrl({
    title: destination.name,
    subtitle: description,
    kind: "Destination",
  });

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: {
      index: destinationIsIndexable(destination) && !isPreviewDeployment,
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url,
      images: [{ url: image, alt: destination.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = bySlug.get(slug);
  if (!destination) notFound();

  const url = siteOrigin + destinationPath(slug);
  const description = destinationDescription(destination);
  const kind = destinationKindLabel(destination.kind);
  const direction = cleanDirection(destination.cells[5] ?? "");
  const nearby = nearbyReferences(destination, rows);
  const related = relatedDestinations(destination, rows);
  const notes = destinationPlanningNotes(destination);
  const days = destinationDays(destination);
  const months = destinationMonths(destination);
  const intro = [
    `${destination.name} is listed in the community destination record as a ${kind}${
      destination.distanceKm === null
        ? " without a recorded distance."
        : ` about ${destination.distanceKm} km from Bengaluru.`
    }`,
    days === "Not recorded"
      ? "The source does not say how long the trip takes."
      : `The source lists ${days} for the trip.`,
    months === "Not recorded"
      ? ""
      : `It gives ${months} as the best window.`,
  ]
    .filter(Boolean)
    .join(" ");

  const facts: Array<[string, string]> = [    [
      "Listed distance",
      destination.distanceKm === null
        ? "Not recorded"
        : `${destination.distanceKm} km from Bengaluru`,
    ],
    ["Source type", kind],
    ["Direction as recorded", direction || "Not recorded"],
    ["Road as recorded", destination.cells[6]?.trim() || "Not recorded"],
    ["Food", yesNo(destination.cells[7], "Recorded", "None recorded")],
    ["Stay", yesNo(destination.cells[8], "Recorded", "None recorded")],
    ["Fuel", destination.cells[10]?.trim() || "Not recorded"],
    ["Days required", destinationDays(destination)],
    ["Months in the source", destinationMonths(destination)],
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-2 py-10 sm:px-0 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            destinationJsonLd(destination, { url, description, kindLabel: kind }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Destinations", path: "/destinations" },
              { name: destination.name, path: destinationPath(slug) },
            ]),
          ]),
        }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link className="underline-offset-4 hover:underline" href="/destinations">
          Destinations
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{destination.name}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {kind}
          {destination.distanceKm === null
            ? " · distance not recorded"
            : ` · ${destination.distanceKm} km from Bengaluru`}
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {destination.name} bike ride from Bengaluru
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {intro}
        </p>
      </header>

      <DestinationHighlights
        km={destination.distanceKm}
        days={days}
        season={monthsInSeason(destination)}
      />

      <aside
        aria-label="Historical source notice"
        className="mt-8 rounded-xl bg-secondary p-6 text-secondary-foreground"
      >
        <h2 className="text-lg font-semibold">
          A 2010 record, not current road advice
        </h2>
        <p className="mt-2 max-w-prose leading-relaxed">
          Distances, facilities and months come from a worksheet the community
          has not updated since 2010. Roads, fuel stops and restaurants change.
          Confirm today&apos;s conditions before you plan around any value here.
        </p>
      </aside>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
        <article className="min-w-0 space-y-12">
          <section aria-labelledby="facts-title">
            <h2 id="facts-title" className="text-2xl font-semibold">
              What the record says
            </h2>
            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-0 border-t border-border pt-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-base">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="notes-title" className="max-w-prose">
            <h2 id="notes-title" className="text-2xl font-semibold">
              Before you ride there
            </h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          {nearby.length > 0 && (
            <section aria-labelledby="nearby-title" className="max-w-prose">
              <h2 id="nearby-title" className="text-2xl font-semibold">
                Other places in the same record
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                The contributor paired these with {destination.name}. Distances
                are from this destination, as recorded.
              </p>
              <ul className="mt-5 space-y-3">
                {nearby.map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    {item.destination ? (
                      <Link
                        href={destinationPath(slugs[item.destination.id])}
                        className="underline underline-offset-4"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                    {item.distanceKm ? (
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        · {item.distanceKm} km away
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="related-title">
            <h2 id="related-title" className="text-2xl font-semibold">
              Similar rides
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={destinationPath(slugs[item.id])}
                    className="group block rounded-xl border border-border p-5 hover:border-foreground/40"
                  >
                    <span className="block font-semibold group-hover:underline">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {destinationKindLabel(item.kind)}
                      {item.distanceKm === null
                        ? " · distance not recorded"
                        : ` · ${item.distanceKm} km`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold">Check the location</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The source has no coordinates, so this opens a name search rather
              than a pin.
            </p>
            <a
              href={
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(destination.name + ", Karnataka, India")
              }
              rel="noopener noreferrer nofollow"
              className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              Search {destination.name} in Google Maps
            </a>
          </div>

          <div className="rounded-xl border border-border p-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">
              Source record
            </h2>
            <p className="mt-2">
              Record {destination.sourceNumber} from{" "}
              {destination.source === "wiki"
                ? "the subreddit wiki"
                : "the wiki-linked worksheet"}.
            </p>
            <Link
              href="/wiki/routes-and-destinations"
              className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4"
            >
              How this collection was imported
            </Link>
          </div>

          <Link
            href="/destinations"
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            All destinations
          </Link>
        </aside>
      </div>
    </main>
  );
}
