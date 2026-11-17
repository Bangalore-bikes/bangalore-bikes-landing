import guideData from "./wiki-guides.json";
import destinationData from "./wiki-destinations.json";
import { destinationArchiveSchema, parseWikiGuides } from "@/lib/wiki";

export const wikiGuides = parseWikiGuides(guideData);
export const destinationArchive =
  destinationArchiveSchema.parse(destinationData);
export const wikiImportedOn = "2026-11-17";
