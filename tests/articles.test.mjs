import assert from "node:assert/strict";
import test from "node:test";
import { parseArticles, publishedArticles } from "../src/lib/articleSchema.ts";

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
  sources: [
    {
      label: "Original discussion",
      url: "https://www.reddit.com/r/bangalorebikes/",
    },
  ],
};

test("only published articles are visible, newest publication first", () => {
  const draft = {
    ...article,
    slug: "draft",
    status: "draft",
    permissionConfirmed: false,
  };
  const newer = { ...article, slug: "newer", publishedAt: article.updatedAt };
  assert.deepEqual(
    publishedArticles([draft, article, newer]).map((entry) => entry.slug),
    ["newer", "test-story"],
  );
});

test("publication requires author permission and a publication timestamp", () => {
  assert.throws(() =>
    parseArticles([{ ...article, permissionConfirmed: false }]),
  );
  const missingDate = { ...article };
  delete missingDate.publishedAt;
  assert.throws(() => parseArticles([missingDate]));
  assert.equal(
    parseArticles([
      { ...missingDate, status: "draft", permissionConfirmed: false },
    ]).length,
    1,
  );
});

test("invalid slugs, dates, unknown keys and duplicate slugs are rejected", () => {
  for (const patch of [
    { slug: "../escape" },
    { updatedAt: "not a date" },
    { updatedAt: "2025-01-01T00:00:00Z" },
    { updatedAt: "2026-01-02T00:00:00+99:99" },
    { adminApproved: true },
  ])
    assert.throws(() => parseArticles([{ ...article, ...patch }]));
  assert.throws(() => parseArticles([article, article]));
});

test("structured content supports paragraphs, headings and lists, not executable blocks", () => {
  assert.equal(
    parseArticles([
      {
        ...article,
        blocks: [
          { type: "heading", text: "A section" },
          { type: "paragraph", text: "Some text" },
          { type: "list", items: ["One", "Two"] },
        ],
      },
    ]).length,
    1,
  );
  assert.throws(() =>
    parseArticles([
      {
        ...article,
        blocks: [{ type: "html", text: "<script>bad()</script>" }],
      },
    ]),
  );
  assert.throws(() => parseArticles([{ ...article, blocks: [] }]));
});

test("source URLs must be HTTPS without credentials or control characters", () => {
  for (const url of [
    "javascript:alert(1)",
    "not a URL",
    "https://user:password@example.com",
    "https://example.com/\r\nInjected",
  ]) {
    assert.throws(() =>
      parseArticles([{ ...article, sources: [{ label: "Source", url }] }]),
    );
  }
});

test("an empty archive is valid", () =>
  assert.deepEqual(publishedArticles([]), []));
