import assert from "node:assert/strict";
import test from "node:test";

import {
  isCollectionName,
  recordIdOf,
  validateRecord,
} from "../src/lib/content-config.ts";

const article = {
  slug: "test-story",
  title: "Test story",
  summary: "A test-only summary.",
  author: "Test author",
  status: "published",
  permissionConfirmed: true,
  publishedAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
  blocks: [{ type: "paragraph", text: "Test-only article text." }],
  sources: [],
};

const ride = {
  slug: "test-ride",
  title: "Test ride",
  description: "A test-only ride.",
  startsAt: "2026-12-01T01:00:00Z",
  endsAt: "2026-12-01T05:00:00Z",
  meetingPoint: "Test point",
  destination: "Test destination",
  distanceKm: 42,
  organizer: "Test organizer",
  experience: "All riders",
  redditUrl:
    "https://www.reddit.com/r/bangalorebikes/comments/abc123/test-ride/",
  updatedAt: "2026-11-17T00:00:00Z",
  confirmed: true,
  status: "scheduled",
};

const resource = {
  id: "test-resource",
  title: "Example resource",
  category: "Community",
  summary: "An editorial summary.",
  url: "https://www.reddit.com/r/bangalorebikes/comments/abc123/example/",
  sourceLabel: "Member discussion on r/BangaloreBikes",
  sourceCheckedOn: "2026-11-16",
  status: "published",
};

test("collection names are the only accepted storage keys", () => {
  for (const name of ["articles", "rides", "resources"]) {
    assert.equal(isCollectionName(name), true);
  }
  assert.equal(isCollectionName("blogs"), false);
  assert.equal(isCollectionName("__proto__"), false);
});

test("published status drives article visibility and ids come from the slug", () => {
  const result = validateRecord("articles", article);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.id, "test-story");
  assert.equal(result.published, true);
  assert.equal(recordIdOf("articles", article), "test-story");
});

test("a draft cannot be published by the visibility override", () => {
  const draft = { ...article, status: "draft", permissionConfirmed: false };
  const result = validateRecord("articles", draft, true);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.message, /draft/i);
  assert.equal(validateRecord("articles", draft).ok, true);
});

test("a published article or resource may be hidden without changing status", () => {
  const articleResult = validateRecord("articles", article, false);
  assert.equal(articleResult.ok, true);
  if (articleResult.ok) assert.equal(articleResult.published, false);

  const resourceResult = validateRecord("resources", resource, false);
  assert.equal(resourceResult.ok, true);
  if (resourceResult.ok) assert.equal(resourceResult.published, false);
});

test("rides are public by default and can be hidden explicitly", () => {
  const visible = validateRecord("rides", ride);
  assert.equal(visible.ok, true);
  if (visible.ok) assert.equal(visible.published, true);

  const hidden = validateRecord("rides", ride, false);
  assert.equal(hidden.ok, true);
  if (hidden.ok) assert.equal(hidden.published, false);
});

test("schema violations reject the record with field paths", () => {
  const missingRedditUrl = { ...ride, redditUrl: "" };
  const result = validateRecord("rides", missingRedditUrl);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.issues.some((issue) => issue.startsWith("redditUrl")));

  const unconfirmed = { ...ride, confirmed: false };
  assert.equal(validateRecord("rides", unconfirmed).ok, false);

  const badUrl = { ...resource, url: "https://example.com/not-reddit" };
  assert.equal(validateRecord("resources", badUrl).ok, false);
});

test("resource ids are read from the id field", () => {
  assert.equal(recordIdOf("resources", resource), "test-resource");
  assert.equal(recordIdOf("resources", { slug: "wrong" }), null);
  assert.equal(recordIdOf("articles", null), null);
});
