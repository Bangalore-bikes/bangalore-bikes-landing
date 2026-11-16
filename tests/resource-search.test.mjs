import assert from "node:assert/strict";
import test from "node:test";
import { filterResources } from "../src/lib/resourceSearch.ts";

const resources = [
  {
    id: "etiquette",
    title: "Community etiquette",
    category: "Community",
    summary: "Ask before sending private messages.",
  },
  {
    id: "service",
    title: "Workshop experience",
    category: "Maintenance",
    summary: "A member's repair follow-up.",
  },
];

test("blank queries preserve all resources and their order", () => {
  assert.deepEqual(filterResources(resources, "   ", "All"), resources);
});

test("search ignores case and extra whitespace and matches across fields", () => {
  assert.deepEqual(filterResources(resources, "  WORKSHOP   repair ", "All"), [
    resources[1],
  ]);
  assert.deepEqual(filterResources(resources, "private", "All"), [
    resources[0],
  ]);
});

test("category and search must both match", () => {
  assert.deepEqual(filterResources(resources, "workshop", "Community"), []);
  assert.deepEqual(filterResources(resources, "", "Maintenance"), [
    resources[1],
  ]);
});

test("unknown queries and categories return no results", () => {
  assert.deepEqual(
    filterResources(resources, "unlisted destination", "All"),
    [],
  );
  assert.deepEqual(filterResources(resources, "", "Unlisted"), []);
});

test("filtering does not mutate the content collection", () => {
  const frozen = Object.freeze(
    resources.map((resource) => Object.freeze({ ...resource })),
  );
  filterResources(frozen, "private", "All");
  assert.deepEqual(frozen, resources);
});
