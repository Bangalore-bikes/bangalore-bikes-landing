import type { Destination } from "./wiki.ts";

/**
 * Pure helpers over the imported 2010 destination worksheet. Nothing here
 * imports the dataset, so the client directory and server pages can share the
 * same slug rules without shipping the JSON twice.
 */

const KIND_LABELS: Record<string, string> = {
  Piligrim: "pilgrimage site",
  Hill: "hill",
  "Hill station": "hill station",
  Dam: "dam",
  Ravine: "ravine",
  "Temple Paintings": "temple with paintings",
  "Birds sanctuary": "bird sanctuary",
  River: "river",
  "Water fall": "waterfall",
  Historical: "historical site",
  Barrage: "barrage",
  Archeology: "archaeological site",
  "Wild life": "wildlife area",
  Landscape: "landscape",
  Beach: "beach",
  Caves: "cave",
};

export function destinationKindLabel(kind: string): string {
  const label = KIND_LABELS[kind];
  if (label) return label;
  return kind.trim().toLowerCase() || "destination";
}

export function baseDestinationSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Slugs are derived from the place name because that is what a rider types.
 * The two Hampi records collide, so the later one keeps its source number;
 * every other slug stays clean. Results depend only on array order, so the
 * server and the client directory always agree.
 */
export function destinationSlugIndex(
  rows: readonly Destination[],
): Record<string, string> {
  const seen = new Set<string>();
  const index: Record<string, string> = {};
  for (const row of rows) {
    const base = baseDestinationSlug(row.name) || `destination-${row.sourceNumber}`;
    let slug = base;
    if (seen.has(slug)) slug = `${base}-${row.sourceNumber}`;
    let suffix = 2;
    while (seen.has(slug)) {
      slug = `${base}-${row.sourceNumber}-${suffix}`;
      suffix += 1;
    }
    seen.add(slug);
    index[row.id] = slug;
  }
  return index;
}

export function destinationPath(slug: string): string {
  return `/destinations/${slug}`;
}

/**
 * A record is worth indexing when it actually measured a distance. The two
 * rows without one still get a page for internal linking, but stay noindex.
 */
export function destinationIsIndexable(destination: Destination): boolean {
  return destination.distanceKm !== null;
}

export function cleanDirection(value: string): string {
  return value.replace(/[+\-–—]+/g, " ").replace(/\s+/g, " ").trim();
}

export function destinationMonths(destination: Destination): string {
  const from = destination.cells[15]?.trim();
  const to = destination.cells[16]?.trim();
  if (!from && !to) return "Not recorded";
  if (from && to && from !== to) return `${from} to ${to}`;
  return from || to;
}

export function destinationDays(destination: Destination): string {
  const days = destination.cells[14]?.trim();
  if (!days) return "Not recorded";
  return days === "1" ? "1 day" : `${days} days`;
}

function truncate(text: string, limit: number): string {
  return text.length <= limit ? text : text.slice(0, limit - 1).trimEnd() + "…";
}

export function destinationPageTitle(
  destination: Destination,
  slug: string,
): string {
  const base = `${destination.name} bike ride from Bengaluru`;
  if (slug === baseDestinationSlug(destination.name)) return base;
  return `${destination.name} (record ${destination.sourceNumber}) bike ride from Bengaluru`;
}

/**
 * Every description is built from that record's own fields, so no two share
 * the same text unless the source rows are identical.
 */
export function destinationDescription(destination: Destination): string {
  const distance = destination.distanceKm;
  const direction = cleanDirection(destination.cells[5] ?? "");
  const kind = destinationKindLabel(destination.kind);
  const head =
    distance === null
      ? `${destination.name} in the Bangalore Bikes destination record: a ${kind} from the community wiki.`
      : `${destination.name}: a ${kind} listed ${distance} km from Bengaluru${
          direction ? ` towards ${direction}` : ""
        } in the community's 2010 destination record.`;
  return truncate(head, 158);
}

export function destinationSummary(destination: Destination): string {
  const distance = destination.distanceKm;
  const kind = destinationKindLabel(destination.kind);
  if (distance === null) {
    return `${destination.name} appears in the community destination record as a ${kind}. The source does not list a distance, so treat the location as unconfirmed.`;
  }
  const days = destinationDays(destination);
  return `${destination.name} is listed as a ${kind} about ${distance} km from Bengaluru. The community recorded it as a ${days} ride, best between ${destinationMonths(
    destination,
  )} in the source's words.`;
}

/**
 * Notes are conditional on the source row, so a page for a well-served place
 * reads differently from one where the record says there is nothing.
 */
export function destinationPlanningNotes(
  destination: Destination,
): string[] {
  const notes: string[] = [];
  const road = destination.cells[6]?.trim().toLowerCase();
  const food = destination.cells[7]?.trim().toLowerCase();
  const lodge = destination.cells[8]?.trim().toLowerCase();
  const petrol = destination.cells[10]?.trim();
  const remarks = destination.cells[13]?.trim();

  if (road === "poor") {
    notes.push(
      "The 2010 record rated the road poor. Check the surface with someone who rode it recently before committing to it.",
    );
  } else if (road === "good") {
    notes.push(
      "The 2010 record rated the road good. That says nothing about today's traffic, diversions or resurfacing.",
    );
  }

  if (food === "no") {
    notes.push(
      "No food is recorded for the place itself. Carry water and something to eat rather than assuming a stall is open.",
    );
  } else if (food === "yes") {
    notes.push("Food was recorded at or near the destination. Confirm opening hours on the day.");
  }

  if (lodge === "no") {
    notes.push(
      "No stay is recorded, so plan this as a there-and-back ride rather than an overnight stop.",
    );
  } else if (lodge === "yes") {
    notes.push("Somewhere to stay was recorded. Book and confirm before a late arrival.");
  }

  if (petrol) {
    notes.push(`The last fuel stop noted in the source is ${petrol}. Fill up before it.`);
  }

  if (remarks) {
    notes.push(
      `What the contributor highlighted: ${remarks.replace(/\s*\+\s*/g, " + ")}.`,
    );
  }

  notes.push(
    "Distances, facilities and months are 2010 source values, not current advice. Confirm the route, fuel and food before you leave.",
  );

  return notes;
}

/**
 * Nearby references in the worksheet are source record numbers, not names.
 * Some rows put a place name in that column instead, which is returned as a
 * plain label with no link.
 */
export function nearbyReferences(
  destination: Destination,
  rows: readonly Destination[],
): Array<{ label: string; distanceKm: string | null; destination: Destination | null }> {
  const refs = (destination.cells[11] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const distances = (destination.cells[12] ?? "")
    .split(",")
    .map((value) => value.trim());

  return refs.map((ref, index) => {
    const match = /^\d+$/.test(ref)
      ? rows.find((row) => row.sourceNumber === ref) ?? null
      : null;
    return {
      label: match ? match.name : ref,
      distanceKm: distances[index] || null,
      destination: match,
    };
  });
}

/**
 * Related links favour the same kind of place and then similar distances, so
 * the six links at the bottom of a page are actually plausible alternatives.
 */
export function relatedDestinations(
  destination: Destination,
  rows: readonly Destination[],
  limit = 6,
): Destination[] {
  const distance = destination.distanceKm;
  const candidates = rows.filter((row) => row.id !== destination.id);
  const score = (row: Destination): number => {
    let value = row.kind === destination.kind ? 0 : 100;
    if (distance !== null && row.distanceKm !== null) {
      value += Math.abs(row.distanceKm - distance);
    } else {
      value += 50;
    }
    return value;
  };
  return [...candidates].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name)).slice(0, limit);
}

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Which of the 12 months fall inside the source's from/to range. Wraps over the year end. */
export function monthsInSeason(destination: Destination): boolean[] | null {
  const from = MONTH_NAMES.indexOf(destination.cells[15]?.trim() as never);
  const to = MONTH_NAMES.indexOf(destination.cells[16]?.trim() as never);
  if (from === -1 || to === -1) return null;
  return MONTH_NAMES.map((_, month) =>
    from <= to ? month >= from && month <= to : month >= from || month <= to,
  );
}
