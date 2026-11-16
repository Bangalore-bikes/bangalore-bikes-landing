import { readFileSync } from "node:fs";
import { parseResourceCollection } from "../src/lib/resourceSchema.ts";
import { parseRides } from "../src/lib/rideSchema.ts";
import { parseArticles } from "../src/lib/articleSchema.ts";

let failed = false;
for (const [file, parse] of [
  ["resources.json", parseResourceCollection],
  ["rides.json", parseRides],
  ["articles.json", parseArticles],
]) {
  try {
    const records = parse(
      JSON.parse(
        readFileSync(new URL("../src/data/" + file, import.meta.url), "utf8"),
      ),
    );
    console.log(file + ": " + records.length + " valid entries");
  } catch (error) {
    failed = true;
    console.error(file + ": validation failed");
    if (
      error &&
      typeof error === "object" &&
      "issues" in error &&
      Array.isArray(error.issues)
    ) {
      for (const issue of error.issues)
        console.error("  " + issue.path.join(".") + ": " + issue.message);
    } else
      console.error(error instanceof Error ? error.message : "Invalid content");
  }
}
if (failed) process.exitCode = 1;
