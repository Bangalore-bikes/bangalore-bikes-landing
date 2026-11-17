import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinationArchive } from "@/data/wiki";

export function WikiHighlights() {
  return (
    <section
      aria-labelledby="wiki-highlights-title"
      className="grid gap-8 border-b border-border py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14"
    >
      <div>
        <h2
          id="wiki-highlights-title"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        >
          More than the next ride.
        </h2>
        <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
          The community handbook brings our useful knowledge together. Read the
          guides here, from joining your first group ride to finding a place to
          explore.
        </p>
        <Link
          href="/wiki"
          className="mt-5 inline-flex min-h-11 items-center gap-3 font-medium underline underline-offset-4"
        >
          Explore the handbook{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {[
          [
            "/destinations",
            "Where shall we ride?",
            destinationArchive.rows.length +
              " historical destination records, searchable by name, type and listed distance.",
          ],
          [
            "/wiki/ride-rules",
            "Your first group ride",
            "Gear, group conduct and what to check before you set off.",
          ],
          [
            "/wiki/emergency-contacts",
            "Know who to call",
            "Emergency services first, community coordination second.",
          ],
        ].map(([href, title, description]) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-5 py-5 first:pt-0"
          >
            <div>
              <h3 className="text-xl font-semibold group-hover:underline group-hover:underline-offset-4">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
