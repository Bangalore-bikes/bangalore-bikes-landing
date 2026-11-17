import assert from "node:assert/strict";
import test from "node:test";
import {
  parseDestinationSheet,
  parseWikiGuides,
  destinationArchiveSchema,
} from "../src/lib/wiki.ts";
import { filterDestinations } from "../src/lib/destinationSearch.ts";
import { readFileSync } from "node:fs";

const row = (number, name, kind, distance) => ({
  c: [
    number,
    name,
    "**",
    kind,
    distance,
    "Mysore",
    "Good",
    "No",
    "No",
    "",
    "",
    "",
    "",
    "",
    1,
    "Jan",
    "Dec",
  ].map((v) => (v === null ? null : { v })),
});
const source = JSON.stringify({
  table: {
    cols: Array.from({ length: 17 }, (_, i) => ({
      label: i === 0 ? "NOT UPDATED SINCE 2010" : "Column " + i,
    })),
    rows: [
      row(92, "Magodu falls", "Water fall", 400),
      row(92, "Mrudeshwara", "Piligrim", 400),
      row(103, "Varaahi", "Landscape", null),
    ],
  },
});

test("worksheet parsing preserves every column and duplicate source numbers without merging places", () => {
  const archive = parseDestinationSheet(
    "/* response */ google.visualization.Query.setResponse(" + source + ");",
  );
  assert.equal(archive.rows.length, 3);
  assert.equal(archive.rows[0].cells.length, 17);
  assert.equal(archive.rows[0].cells[6], "Good");
  assert.equal(archive.rows[0].sourceNumber, archive.rows[1].sourceNumber);
  assert.notEqual(archive.rows[0].id, archive.rows[1].id);
  assert.equal(archive.rows[2].distanceKm, null);
  assert.ok(archive.notice.includes("2010"));
});

test("invalid sheets fail instead of silently publishing incomplete records", () => {
  assert.throws(() => parseDestinationSheet("<html>Access denied</html>"));
  assert.throws(() =>
    parseDestinationSheet(JSON.stringify({ table: { cols: [], rows: [] } })),
  );
  const invalid = JSON.parse(source);
  invalid.table.rows[0].c = invalid.table.rows[0].c.slice(0, 3);
  assert.throws(() => parseDestinationSheet(JSON.stringify(invalid)));
});

test("destination filters intersect words, category and distance without inventing unknown distances", () => {
  const entries = parseDestinationSheet(source).rows;
  assert.equal(
    filterDestinations(entries, "  MAGODU  falls ", "All", "all").length,
    1,
  );
  assert.equal(filterDestinations(entries, "", "Piligrim", "all").length, 1);
  assert.equal(
    filterDestinations(entries, "falls", "Piligrim", "all").length,
    0,
  );
  assert.equal(filterDestinations(entries, "", "All", "150").length, 0);
  assert.equal(filterDestinations(entries, "", "All", "400").length, 2);
  assert.equal(filterDestinations(entries, "Varaahi", "All", "all").length, 1);
  assert.equal(entries.length, 3);
});

test("published handbook sources retain the full historical collection and valid navigation anchors", () => {
  const archive = destinationArchiveSchema.parse(
    JSON.parse(
      readFileSync(
        new URL("../src/data/wiki-destinations.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  assert.equal(archive.rows.length, 109);
  assert.equal(new Set(archive.rows.map((row) => row.id)).size, 109);
  assert.equal(
    archive.rows.filter((row) => row.sourceNumber === "92").length,
    2,
  );
  assert.equal(archive.rows.filter((row) => row.name === "Hampi").length, 2);
  assert.ok(archive.notice.includes("2010"));
  const guides = parseWikiGuides(
    JSON.parse(
      readFileSync(
        new URL("../src/data/wiki-guides.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  assert.equal(guides.length, 6);
  assert.throws(() => parseWikiGuides([guides[0], guides[0]]));
  assert.throws(() =>
    parseWikiGuides([
      {
        ...guides[0],
        sections: [guides[0].sections[0], guides[0].sections[0]],
      },
    ]),
  );
});
