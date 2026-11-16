"use client";

import { useId, useState } from "react";
import type { CommunityResource } from "@/lib/resourceSchema";
import { filterResources } from "@/lib/resourceSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommunityResources } from "./community-resources";

export function ResourceDirectory({
  entries,
}: {
  entries: readonly CommunityResource[];
}) {
  const categories = [
    "All",
    ...new Set(entries.map((resource) => resource.category)),
  ];
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const resources = filterResources(entries, query, category);
  const filtered = query.length > 0 || category !== "All";

  function resetFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor={searchId} className="block font-medium">
          Search community resources
        </label>
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try workshop or community"
          className="min-h-11"
          aria-describedby={searchId + "-help"}
        />
        <p id={searchId + "-help"} className="text-sm text-muted-foreground">
          Search the links listed here, not Reddit itself.
        </p>
      </div>
      <fieldset>
        <legend className="mb-3 font-medium">Category</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "secondary" : "outline"}
              className="min-h-11"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item === "All" ? "All categories" : item}
            </Button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted-foreground"
        >
          {resources.length} {resources.length === 1 ? "resource" : "resources"}{" "}
          found
        </p>
        {filtered && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      {resources.length > 0 ? (
        <CommunityResources resources={resources} />
      ) : (
        <div className="space-y-2 py-6">
          <h3 className="text-xl font-semibold">
            {entries.length === 0
              ? "No published resources yet"
              : "No matching resources"}
          </h3>
          <p className="text-muted-foreground">
            {entries.length === 0
              ? "Published community links will appear here as they are added."
              : "Try a different search or clear the filters to see all resources."}
          </p>
        </div>
      )}
    </div>
  );
}
