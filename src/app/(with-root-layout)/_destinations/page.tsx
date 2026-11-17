import Link from "next/link";
import { DestinationDirectory } from "@/components/wiki/destination-directory";
import { destinationArchive } from "@/data/wiki";

export default function DestinationsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-9 px-2 py-10 sm:px-0 sm:py-16">
      <header>
        <Link
          href="/wiki"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Back to the handbook
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next destination.
        </h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted-foreground">
          Explore {destinationArchive.rows.length} places from the community wiki
          and its original Karnataka travel worksheet, right here on the website.
        </p>
      </header>
      <aside
        aria-label="Historical source notice"
        className="rounded-xl bg-secondary p-6 text-secondary-foreground"
      >
        <h2 className="text-lg font-semibold">
          Historical source: last updated in 2010
        </h2>
        <p className="mt-2 max-w-prose leading-relaxed">
          These are original source records, not current road, access or service
          information. Check today’s conditions before planning your ride.
        </p>
        <Link
          href="/wiki/routes-and-destinations"
          className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          About this collection and its sources
        </Link>
      </aside>
      <DestinationDirectory
        entries={destinationArchive.rows}
        columns={destinationArchive.columns}
      />
      <section className="border-t border-border pt-7">
        <h2 className="text-xl font-semibold">Original maps & worksheet</h2>
        <ul className="mt-4 space-y-4 text-sm">
          <li>
            <a
              className="underline underline-offset-4"
              href="https://maps.app.goo.gl/ypXZdbHF8ctnFnJb6"
            >
              Google Maps list linked by the wiki
            </a>
          </li>
          <li>
            <a
              className="underline underline-offset-4"
              href="https://docs.google.com/spreadsheets/d/1dJyNKE22LkDEHM-WbbByP4EyoMx03UsvztuGk-cg95k/edit"
            >
              Original public worksheet
            </a>
          </li>
          <li>
            <a
              className="underline underline-offset-4"
              href="https://www.reddit.com/r/bangalorebikes/wiki/index/routes_and_destinations/"
            >
              Destination wiki and original contributor credit
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
