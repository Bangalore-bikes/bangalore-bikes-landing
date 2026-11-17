import type { Destination } from "./wiki";

export type DestinationFilters = {
  query: string;
  kind: string;
  distance: string;
};
const distances = new Set(["all", "100", "150", "300", "600"]);

export function readDestinationFilters(
  params: URLSearchParams,
  kinds: readonly string[],
): DestinationFilters {
  const kind = params.get("type") ?? "All";
  const distance = params.get("distance") ?? "all";
  return {
    query: (params.get("q") ?? "").slice(0, 200),
    kind: kinds.includes(kind) ? kind : "All",
    distance: distances.has(distance) ? distance : "all",
  };
}

export function writeDestinationFilters(
  params: URLSearchParams,
  filters: DestinationFilters,
) {
  const next = new URLSearchParams(params);
  for (const [key, value, empty] of [
    ["q", filters.query.slice(0, 200), ""],
    ["type", filters.kind, "All"],
    ["distance", filters.distance, "all"],
  ]) {
    if (value === empty) next.delete(key);
    else next.set(key, value);
  }
  return next;
}

function csvCell(value: string) {
  // Spreadsheet apps can evaluate formula-looking values even in quoted CSV.
  // Escape them without changing the source records held by the website.
  const guarded =
    /^[=+\-@]/.test(value.trimStart()) || /^[\t\r\n]/.test(value)
      ? "'" + value
      : value;
  return '"' + guarded.replaceAll('"', '""') + '"';
}

export function createDestinationCsv(
  entries: readonly Destination[],
  columns: readonly string[],
  origin: string,
) {
  const note =
    "Historical source worksheet last updated in 2010; not current road, access or service information.";
  const rows = [
    [...columns, "Historical source notice", "Original record"],
    ...entries.map((entry) => [
      ...entry.cells,
      note,
      origin + "/destinations#place-" + entry.id,
    ]),
  ];
  return (
    "\uFEFF" +
    rows.map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
