"use client";

import { useId, useState } from "react";
import type { Destination } from "@/lib/wiki";
import { filterDestinations } from "@/lib/destinationSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DestinationDirectory({
  entries,
  columns,
}: {
  entries: readonly Destination[];
  columns: readonly string[];
}) {
  const formId = useId();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [distance, setDistance] = useState("all");
  const results = filterDestinations(entries, query, kind, distance);
  const kinds = [...new Set(entries.map((entry) => entry.kind))].sort();
  const reset = () => {
    setQuery("");
    setKind("All");
    setDistance("all");
  };
  const selectStyle =
    "mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring";
  return (
    <section aria-labelledby="destination-list-title">
      <h2 id="destination-list-title" className="text-2xl font-semibold">
        Explore the collection
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor={formId + "-search"} className="text-sm font-medium">
            Search destinations
          </label>
          <Input
            id={formId + "-search"}
            type="search"
            placeholder="Try Nandi, waterfall or Mysore"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 min-h-11"
          />
        </div>
        <div>
          <label htmlFor={formId + "-kind"} className="text-sm font-medium">
            Source type
          </label>
          <select
            id={formId + "-kind"}
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            className={selectStyle}
          >
            <option value="All">All types</option>
            {kinds.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={formId + "-distance"} className="text-sm font-medium">
            Listed distance
          </label>
          <select
            id={formId + "-distance"}
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
            className={selectStyle}
          >
            <option value="all">Any distance</option>
            <option value="100">Up to 100 km</option>
            <option value="150">Up to 150 km</option>
            <option value="300">Up to 300 km</option>
            <option value="600">Up to 600 km</option>
          </select>
        </div>
      </div>
      <div className="my-6 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {results.length} of {entries.length} destinations
        </p>
        {(query || kind !== "All" || distance !== "all") && (
          <Button variant="outline" onClick={reset}>
            Reset destinations
          </Button>
        )}
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Distances and every expanded field below are historical source values,
        not current travel advice. Open a place to read its original record.
      </p>
      <div className="divide-y divide-border border-y border-border">
        {results.map((entry) => (
          <details
            key={entry.id}
            id={"place-" + entry.id}
            className="group scroll-mt-28 py-1"
          >
            <summary className="min-h-16 cursor-pointer py-5 pr-2 marker:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span className="ml-2 inline-flex w-[calc(100%-2rem)] flex-wrap items-baseline justify-between gap-x-5 gap-y-2 align-top">
                <span className="text-lg font-semibold">{entry.name}</span>
                <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span>{entry.kind}</span>
                  <span>
                    {entry.distanceKm === null
                      ? "Distance not listed"
                      : "Listed: " + entry.distanceKm + " km"}
                  </span>
                </span>
              </span>
            </summary>
            <div className="pb-7 pl-5 sm:pl-7">
              <p className="mb-4 text-sm text-muted-foreground">
                Historical record from{" "}
                {entry.source === "wiki"
                  ? "the subreddit wiki"
                  : "the wiki-linked worksheet"}
                ; source No. {entry.sourceNumber}. Original spellings and
                abbreviations are retained.
              </p>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {entry.cells.map((value, index) => (
                  <div key={index} className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {columns[index]}
                    </dt>
                    <dd className="mt-1 break-words text-sm">
                      {value || "Not recorded"}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={
                  "https://www.google.com/maps/search/?api=1&query=" +
                  encodeURIComponent(entry.name + ", India")
                }
                className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                Search this name in Google Maps
              </a>
            </div>
          </details>
        ))}
      </div>
      {results.length === 0 && (
        <div className="space-y-4 py-10">
          <h3 className="text-xl font-semibold">No matching destinations</h3>
          <p className="text-muted-foreground">
            Try a wider distance, another type, or clear the search. Entries
            without a distance only appear under Any distance.
          </p>
          <Button variant="outline" onClick={reset}>
            Show all destinations
          </Button>
        </div>
      )}
    </section>
  );
}
