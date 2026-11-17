import assert from "node:assert/strict";
import test from "node:test";
import {
  readDestinationFilters,
  writeDestinationFilters,
  createDestinationCsv,
} from "../src/lib/destinationSharing.ts";

test("shared destination filters round-trip without discarding unrelated parameters", () => {
  const params = new URLSearchParams("utm_source=community&q=old");
  const filters = {
    query: "Nandi hills",
    kind: "Hill station",
    distance: "100",
  };
  const shared = writeDestinationFilters(params, filters);
  assert.equal(shared.get("utm_source"), "community");
  assert.deepEqual(readDestinationFilters(shared, ["Hill station"]), filters);
  assert.equal(
    params.get("q"),
    "old",
    "original URL parameters are not mutated",
  );
  const reset = writeDestinationFilters(shared, {
    query: "",
    kind: "All",
    distance: "all",
  });
  assert.equal(reset.toString(), "utm_source=community");
});

test("invalid shared types and distances fall back to safe visible defaults", () => {
  assert.deepEqual(
    readDestinationFilters(new URLSearchParams("type=Invented&distance=-1"), [
      "Hill station",
    ]),
    { query: "", kind: "All", distance: "all" },
  );
  assert.equal(
    readDestinationFilters(new URLSearchParams("q=" + "a".repeat(500)), [])
      .query.length,
    200,
  );
});

test("CSV export preserves columns, quotes, Unicode, historical context and safe cell values", () => {
  const entry = {
    id: "5-nandi",
    sourceNumber: "5",
    name: "Nandi",
    kind: "Hill station",
    distanceKm: 70,
    source: "sheet",
    cells: [
      "Namma, Bengaluru",
      'He said "hello"',
      '=HYPERLINK("https://bad.invalid")',
      "  +SUM(1,2)",
      "-2",
      "@value",
      "\t=SUM(1)",
      "line\nbreak",
      ...Array(9).fill(""),
    ],
  };
  const columns = Array.from({ length: 17 }, (_, i) => "Column " + i);
  const csv = createDestinationCsv(
    [entry],
    columns,
    "https://bangalorebikes.com",
  );
  assert.ok(csv.startsWith('\uFEFF"Column 0"'));
  assert.ok(csv.includes('"Namma, Bengaluru"'));
  assert.ok(csv.includes('"He said ""hello"""'));
  assert.ok(csv.includes("\"'=HYPERLINK("));
  assert.ok(csv.includes('"\'  +SUM(1,2)"'));
  assert.ok(csv.includes('"\'-2"'));
  assert.ok(csv.includes('"\'@value"'));
  assert.ok(csv.includes('"\'\t=SUM(1)"'));
  assert.ok(csv.includes('"line\nbreak"'));
  assert.ok(csv.includes("2010"));
  assert.ok(
    csv.includes("https://bangalorebikes.com/destinations#place-5-nandi"),
  );
  assert.ok(csv.endsWith("\r\n"));
  assert.equal(entry.cells[2], '=HYPERLINK("https://bad.invalid")');
});
