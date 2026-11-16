import assert from "node:assert/strict";
import test from "node:test";
import {
  parseResourceCollection,
  publishedResources,
} from "../src/lib/resourceSchema.ts";

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

test("published resources retain their metadata; drafts stay out of the visible collection", () => {
  const draft = {
    ...resource,
    id: "draft",
    url: resource.url.replace("abc123", "def456"),
    status: "draft",
  };
  assert.equal(parseResourceCollection([resource, draft]).length, 2);
  assert.deepEqual(publishedResources([resource, draft]), [resource]);
});

test("invalid fields, unsupported categories, dates, and approval claims are rejected", () => {
  for (const patch of [
    { title: "" },
    { id: "../x" },
    { category: "Unlisted" },
    { sourceCheckedOn: "2026-02-30" },
    { status: "approved" },
    { sourceLabel: "Moderator-approved" },
    { ignoredTypo: true },
  ])
    assert.throws(
      () => parseResourceCollection([{ ...resource, ...patch }]),
      JSON.stringify(patch),
    );
});

test("source links reject lookalike hosts, other communities, scripts, credentials, and controls", () => {
  for (const url of [
    "not a URL",
    "javascript:alert(1)",
    "https://reddit.com.evil.test/r/bangalorebikes/comments/abc123/",
    "https://www.reddit.com/r/other/comments/abc123/",
    "https://user:password@reddit.com/r/bangalorebikes/comments/abc123/",
    resource.url + "\r\nInjected",
  ])
    assert.throws(() => parseResourceCollection([{ ...resource, url }]), url);
});

test("duplicate IDs and alternate URLs for the same Reddit post are rejected", () => {
  assert.throws(() =>
    parseResourceCollection([
      resource,
      { ...resource, url: resource.url.replace("abc123", "def456") },
    ]),
  );
  assert.throws(() =>
    parseResourceCollection([
      resource,
      {
        ...resource,
        id: "second",
        url: "https://reddit.com/r/bangalorebikes/comments/abc123/another-title/?context=3",
      },
    ]),
  );
});

test("empty collections are valid and source order is preserved", () => {
  assert.deepEqual(publishedResources([]), []);
  assert.deepEqual(publishedResources([resource]), [resource]);
});
