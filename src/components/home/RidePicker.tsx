"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Compass } from "lucide-react";

export type PickerDestination = {
  name: string;
  slug: string;
  km: number;
  kind: string;
  from: string;
  to: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DISTANCES = [
  { label: "Under 60 km", max: 60 },
  { label: "Under 100 km", max: 100 },
  { label: "Under 150 km", max: 150 },
  { label: "Any distance", max: Infinity },
];

function inSeason(item: PickerDestination, month: number): boolean {
  const from = MONTHS.indexOf(item.from);
  const to = MONTHS.indexOf(item.to);
  if (from === -1 || to === -1) return true;
  return from <= to ? month >= from && month <= to : month >= from || month <= to;
}

/** Filters the 2010 destination record by distance, month and type. Not current advice. */
export function RidePicker({ items }: { items: PickerDestination[] }) {
  const [maxIndex, setMaxIndex] = useState(1);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [kind, setKind] = useState("all");

  const kinds = useMemo(
    () => Array.from(new Set(items.map((item) => item.kind))).sort(),
    [items],
  );

  const results = useMemo(() => {
    const max = DISTANCES[maxIndex].max;
    return items
      .filter(
        (item) =>
          item.km <= max &&
          inSeason(item, month) &&
          (kind === "all" || item.kind === kind),
      )
      .sort((a, b) => a.km - b.km);
  }, [items, maxIndex, month, kind]);

  const field =
    "min-h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-dixie";

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Distance">
          {DISTANCES.map((option, index) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={maxIndex === index}
              onClick={() => setMaxIndex(index)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
                maxIndex === index
                  ? "border-dixie bg-dixie text-black"
                  : "border-border hover:border-dixie"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Month
          <select
            className={field}
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Type
          <select
            className={field}
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">Anything</option>
            {kinds.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "place" : "places"} match. Distances and
        months come from the community&apos;s 2010 record, so confirm before you ride.
      </p>

      {results.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border p-6 text-muted-foreground">
          <Compass className="size-5" aria-hidden="true" /> Nothing fits. Try a longer distance
          or another month.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, 9).map((item) => (
            <li key={item.slug}>
              <Link
                href={`/destinations/${item.slug}`}
                className="lift group flex h-full items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span>
                  <span className="block font-semibold leading-snug">{item.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.km} km · {item.kind}
                  </span>
                </span>
                <ArrowUpRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dixie"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/destinations"
        className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4"
      >
        Browse all {items.length} destinations
      </Link>
    </div>
  );
}
