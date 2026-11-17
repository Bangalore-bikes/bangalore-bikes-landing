import { writeFile } from "node:fs/promises";
import {
  parseDestinationSheet,
  destinationSchema,
  destinationArchiveSchema,
} from "../src/lib/wiki.ts";

// Only the public worksheet linked by the subreddit wiki is read. No credentials.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1dJyNKE22LkDEHM-WbbByP4EyoMx03UsvztuGk-cg95k/gviz/tq?tqx=out:json";
const response = await fetch(sheetUrl, { signal: AbortSignal.timeout(30000) });
if (!response.ok)
  throw new Error("Worksheet request failed: " + response.status);
const archive = parseDestinationSheet(await response.text());
if (archive.rows.length < 100)
  throw new Error(
    "Unexpectedly small worksheet; refusing to overwrite the archive",
  );

// The wiki retains a historical Hampi row (No. 76) not present in the linked
// worksheet. Preserve it separately rather than merging the two Hampi records.
if (!archive.rows.some((row) => row.sourceNumber === "76")) {
  const cells = [
    "76",
    "Hampi",
    "***",
    "Historical",
    "350",
    "",
    "Good",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "3",
    "Oct",
    "Dec",
  ];
  const extra = destinationSchema.parse({
    id: "76-hampi",
    sourceNumber: "76",
    name: "Hampi",
    kind: "Historical",
    distanceKm: 350,
    cells,
    source: "wiki",
  });
  const following = archive.rows.findIndex(
    (row) => Number(row.sourceNumber) > 76,
  );
  archive.rows.splice(
    following < 0 ? archive.rows.length : following,
    0,
    extra,
  );
}
destinationArchiveSchema.parse(archive);
await writeFile(
  new URL("../src/data/wiki-destinations.json", import.meta.url),
  JSON.stringify(archive, null, 2) + "\n",
);
console.log(
  "Imported " +
    archive.rows.length +
    " historical destination records, retaining all 17 original columns.",
);
