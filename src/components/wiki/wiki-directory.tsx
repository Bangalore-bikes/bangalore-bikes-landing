"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { WikiGuide } from "@/lib/wiki";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WikiDirectory({ guides }: { guides: readonly WikiGuide[] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = guides.filter((guide) => {
    const text = [
      guide.title,
      guide.summary,
      ...guide.sections.flatMap((section) => [
        section.title,
        ...section.paragraphs,
        ...section.items,
      ]),
    ]
      .join(" ")
      .toLowerCase();
    return words.every((word) => text.includes(word));
  });
  return (
    <section aria-labelledby="handbook-topics-title">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <h2
          id="handbook-topics-title"
          className="text-2xl font-semibold sm:text-3xl"
        >
          Find your next read
        </h2>
        <div className="w-full space-y-2 sm:max-w-sm">
          <label htmlFor={searchId} className="text-sm font-medium">
            Search the handbook
          </label>
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try gear, privacy or emergency"
            className="min-h-11"
          />
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-4 text-sm text-muted-foreground"
      >
        {results.length} {results.length === 1 ? "guide" : "guides"} found
      </p>
      <div className="mt-4 grid gap-x-10 md:grid-cols-2">
        {results.map((guide) => (
          <Link
            key={guide.slug}
            href={"/wiki/" + guide.slug}
            className="group flex items-start justify-between gap-5 border-b border-border py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <div>
              <h3 className="text-xl font-semibold group-hover:underline group-hover:underline-offset-4">
                {guide.title}
              </h3>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {guide.summary}
              </p>
            </div>
            <ArrowRight className="mt-1 size-5 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <div className="space-y-4 py-10">
          <p>No matching guides. Try a different topic.</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            Clear handbook search
          </Button>
        </div>
      )}
    </section>
  );
}
