import assert from "node:assert/strict";
import test from "node:test";

import { postInputSchema } from "../src/lib/posts/schema.ts";
import { slugify, uniqueSlug } from "../src/lib/posts/slugs.ts";

const valid = {
  title: "A ride to Nandi Hills at dawn",
  summary:
    "What it is like to leave Hebbal at five in the morning, what to carry, and where the road turns rough before the climb.",
  bodyMd: "## The start\n\nWe met at the Hebbal flyover.",
  tags: ["rides", "nandi-hills"],
};

test("slugify produces url safe ascii slugs", () => {
  assert.equal(slugify("Nandi Hills at 5 AM!"), "nandi-hills-at-5-am");
  assert.equal(slugify("  ----  "), "");
  assert.equal(slugify("Café ride to Mysuru"), "cafe-ride-to-mysuru");
});

test("uniqueSlug appends a counter instead of failing", () => {
  assert.equal(uniqueSlug("ride", []), "ride");
  assert.equal(uniqueSlug("ride", ["ride"]), "ride-2");
  assert.equal(uniqueSlug("ride", ["ride", "ride-2"]), "ride-3");
  assert.equal(uniqueSlug("", []), "post");
});

test("valid input passes and unknown fields are rejected", () => {
  assert.equal(postInputSchema.safeParse(valid).success, true);
  assert.equal(
    postInputSchema.safeParse({ ...valid, status: "published" }).success,
    false,
  );
});

test("summary, tags and body are bounded", () => {
  assert.equal(
    postInputSchema.safeParse({ ...valid, summary: "too short" }).success,
    false,
  );
  assert.equal(
    postInputSchema.safeParse({
      ...valid,
      tags: ["a1", "b2", "c3", "d4", "e5", "f6"],
    }).success,
    false,
  );
  assert.equal(
    postInputSchema.safeParse({ ...valid, bodyMd: "" }).success,
    false,
  );
  assert.equal(
    postInputSchema.safeParse({ ...valid, bodyMd: "x".repeat(60001) }).success,
    false,
  );
});

test("cover images must be https and slugs must be lowercase", () => {
  assert.equal(
    postInputSchema.safeParse({
      ...valid,
      coverImageUrl: "http://example.com/a.jpg",
    }).success,
    false,
  );
  assert.equal(
    postInputSchema.safeParse({
      ...valid,
      coverImageUrl: "https://example.com/a.jpg",
    }).success,
    true,
  );
  assert.equal(
    postInputSchema.safeParse({ ...valid, slug: "Not A Slug" }).success,
    false,
  );
});
