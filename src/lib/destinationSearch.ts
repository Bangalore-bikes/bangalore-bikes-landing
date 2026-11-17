import type { Destination } from "./wiki";

export function filterDestinations(
  entries: readonly Destination[],
  query: string,
  kind: string,
  distance: string,
) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const searchable = [entry.name, entry.kind, entry.cells[5], entry.cells[13]]
      .join(" ")
      .toLowerCase();
    return (
      (kind === "All" || entry.kind === kind) &&
      (distance === "all" ||
        (entry.distanceKm !== null && entry.distanceKm <= Number(distance))) &&
      words.every((word) => searchable.includes(word))
    );
  });
}
