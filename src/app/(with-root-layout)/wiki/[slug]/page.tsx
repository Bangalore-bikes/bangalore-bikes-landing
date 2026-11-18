import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wikiGuides, wikiImportedOn } from "@/data/wiki";
import {
  breadcrumbJsonLd,
  guideArticleJsonLd,
  jsonLdScript,
} from "@/lib/seo/jsonld";
import { ogImageUrl } from "@/lib/seo/og";
import {
  createPageMetadata,
  siteOrigin,
  siteName,
  isPreviewDeployment,
} from "@/lib/siteMetadata";

export function generateStaticParams() {
  return wikiGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = wikiGuides.find((entry) => entry.slug === slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };
  const base = createPageMetadata("/wiki");
  const title = guide.title + " | " + siteName;
  const url = siteOrigin + "/wiki/" + slug;
  return {
    ...base,
    title: { absolute: title },
    description: guide.summary,
    alternates: {
      canonical: url,
      types: { "text/markdown": siteOrigin + "/md/wiki/" + slug },
    },
    robots: { index: !isPreviewDeployment, follow: true },
    openGraph: {
      ...base.openGraph,
      title,
      description: guide.summary,
      url,
      type: "article",
      images: [
        {
          url: ogImageUrl({
            title: guide.title,
            subtitle: guide.summary,
            kind: "Community handbook",
          }),
          alt: guide.title,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      title,
      description: guide.summary,
      images: [
        ogImageUrl({
          title: guide.title,
          subtitle: guide.summary,
          kind: "Community handbook",
        }),
      ],
    },
  };
}

export default async function WikiGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = wikiGuides.find((entry) => entry.slug === slug);
  if (!guide) notFound();
  return (
    <main className="mx-auto w-full max-w-6xl px-2 py-10 sm:px-0 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            guideArticleJsonLd(guide, { dateModified: wikiImportedOn }),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Community handbook", path: "/wiki" },
              { name: guide.title, path: `/wiki/${guide.slug}` },
            ]),
          ]),
        }}
      />
      <Link
        href="/wiki"
        className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        Back to the handbook
      </Link>
      <header className="mt-5 max-w-3xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {guide.summary}
        </p>
      </header>
      {slug === "emergency-contacts" && (
        <a
          href="tel:112"
          className="mt-7 inline-flex min-h-12 items-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Call emergency services: 112
        </a>
      )}
      {slug === "routes-and-destinations" && (
        <Link
          href="/destinations"
          className="mt-7 inline-flex min-h-12 items-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Browse all destinations
        </Link>
      )}
      <div className="mt-12 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <aside className="h-fit lg:sticky lg:top-24">
          <nav
            aria-label="In this guide"
            className="border-y border-border py-5"
          >
            <h2 className="font-semibold">In this guide</h2>
            <ul className="mt-3 space-y-2">
              {guide.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={"#" + section.id}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="min-w-0 max-w-prose space-y-12">
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <div className="mt-5 space-y-5 text-base leading-8">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {section.items.length > 0 && (
                  <ul className="list-disc space-y-3 pl-5">
                    {section.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
          {slug === "whatsapp" && (
            <div className="rounded-xl bg-secondary p-6">
              <h2 className="text-xl font-semibold">Open the group invite</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Joining is optional and can share your phone number with other
                members. This is the invite linked by the community wiki;
                availability may change.
              </p>
              <a
                href="https://tinyurl.com/bangalorebikeswa"
                className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
              >
                Continue to the WhatsApp invitation
              </a>
            </div>
          )}
          <section
            className="border-t border-border pt-7"
            aria-labelledby="guide-sources-title"
          >
            <h2 id="guide-sources-title" className="text-xl font-semibold">
              Sources & context
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {guide.attribution}
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="break-words underline underline-offset-4"
                    href={source.url}
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <nav
            aria-label="More handbook guides"
            className="border-t border-border pt-7"
          >
            <h2 className="text-xl font-semibold">Keep reading</h2>
            <ul className="mt-4 space-y-3">
              {wikiGuides
                .filter((entry) => entry.slug !== slug)
                .map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      className="inline-flex min-h-11 items-center underline underline-offset-4"
                      href={"/wiki/" + entry.slug}
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </article>
      </div>
    </main>
  );
}
