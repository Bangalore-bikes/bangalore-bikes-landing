import assert from "node:assert/strict";
import test from "node:test";

process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

const ORIGIN = "https://example.test";

const {
  ORGANIZATION_ID,
  WEBSITE_ID,
  guideArticleJsonLd,
  itemListJsonLd,
  jsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} = await import("../src/lib/seo/jsonld.ts");
const { llmsTxt, postMarkdown, wikiGuideMarkdown } = await import(
  "../src/lib/seo/content-mirrors.ts"
);
const { INDEXNOW_KEY, indexNowPayload, submitUrls } = await import(
  "../src/lib/seo/indexnow.ts"
);

const guide = {
  slug: "group-rides",
  title: "Group rides",
  summary: "How a first group ride works, from the meeting point to the last turn.",
  attribution: "Adapted from the r/BangaloreBikes wiki.",
  sections: [
    {
      id: "before",
      title: "Before the ride",
      paragraphs: ["Arrive with a full tank and a working tail light."],
      items: ["Bring water", "Wear a helmet"],
    },
  ],
  sources: [{ label: "The wiki page", url: "https://www.reddit.com/r/bangalorebikes/" }],
};

const post = {
  id: "post-1",
  slug: "nandi-hills-at-dawn",
  title: "Nandi Hills at dawn",
  summary: "What the climb is like before the traffic arrives.",
  bodyMd: "## The climb\n\nLeave at 5am.\n\n- Carry a jacket",
  bodyHtml: "<h2>The climb</h2>",
  coverImageUrl: null,
  tags: ["rides", "routes"],
  authorId: "user-1",
  status: "published",
  publishedAt: "2026-11-01T00:00:00.000Z",
  createdAt: "2026-10-30T00:00:00.000Z",
  updatedAt: "2026-11-02T00:00:00.000Z",
  version: 2,
  moderationNote: null,
  author: { handle: "rider", displayName: "A Rider", avatarUrl: null },
};

test("organization describes only verifiable profiles", () => {
  const data = organizationJsonLd();
  assert.equal(data["@type"], "Organization");
  assert.equal(data["@id"], `${ORIGIN}/#organization`);
  assert.equal(data["@id"], ORGANIZATION_ID);
  assert.equal(data.url, ORIGIN);
  assert.ok(data.sameAs.includes("https://www.reddit.com/r/bangalorebikes/"));
  assert.equal(data.aggregateRating, undefined);
});

test("website links to the organization as publisher", () => {
  const data = websiteJsonLd();
  assert.equal(data["@type"], "WebSite");
  assert.equal(data["@id"], WEBSITE_ID);
  assert.deepEqual(data.publisher, { "@id": ORGANIZATION_ID });
  assert.equal(data.potentialAction, undefined);
});

test("guide article carries no invented social proof", () => {
  const data = guideArticleJsonLd(guide, { dateModified: "2026-11-17" });
  assert.equal(data["@type"], "Article");
  assert.equal(data.url, `${ORIGIN}/wiki/group-rides`);
  assert.deepEqual(data.isPartOf, { "@id": WEBSITE_ID });
  assert.equal(data.dateModified, "2026-11-17");
  assert.ok(data.wordCount > 0);
  assert.match(data.timeRequired, /^PT\d+M$/);
  assert.equal(data.aggregateRating, undefined);
  assert.equal(data.review, undefined);
});

test("item list numbering starts at one and matches the array", () => {
  const data = itemListJsonLd({
    name: "Handbook",
    path: "/wiki",
    items: [
      { name: "One", path: "/wiki/one" },
      { name: "Two", path: "/wiki/two" },
    ],
  });
  assert.equal(data.numberOfItems, 2);
  assert.deepEqual(
    data.itemListElement.map((item) => item.position),
    [1, 2],
  );
  assert.equal(data.itemListElement[1].url, `${ORIGIN}/wiki/two`);
});

test("json-ld serialisation cannot close its script tag", () => {
  const serialised = jsonLdScript({ title: "</script><script>alert(1)</script>" });
  assert.ok(!serialised.includes("</script>"));
  assert.ok(serialised.includes("\\u003c/script"));
});

test("llms.txt lists every guide once with a working URL", () => {
  const text = llmsTxt({ origin: ORIGIN, guides: [guide] });
  assert.match(text, /^# Bangalore Bikes/);
  const occurrences = text.split(`${ORIGIN}/wiki/${guide.slug})`).length - 1;
  assert.equal(occurrences, 1);
  assert.ok(text.includes(`${ORIGIN}/md/wiki/${guide.slug}`));
  assert.ok(text.includes(guide.summary));
  assert.ok(text.includes(`${ORIGIN}/sitemap.xml`));
});

test("wiki markdown mirror is front matter plus the visible sections", () => {
  const markdown = wikiGuideMarkdown(guide, { origin: ORIGIN });
  assert.ok(markdown.startsWith("---\n"));
  assert.ok(markdown.includes(`canonical: ${ORIGIN}/wiki/group-rides`));
  assert.ok(markdown.includes("## Before the ride"));
  assert.ok(markdown.includes("- Bring water"));
  assert.ok(markdown.includes("[The wiki page](https://www.reddit.com/r/bangalorebikes/)"));
});

test("post markdown mirror keeps the stored body verbatim", () => {
  const markdown = postMarkdown(post, { origin: ORIGIN });
  assert.ok(markdown.includes(post.bodyMd.trim()));
  assert.ok(markdown.includes(`canonical: ${ORIGIN}/posts/${post.slug}`));
  assert.ok(markdown.includes("author: A Rider"));
});

test("indexnow payload keeps only same-host urls and dedupes", () => {
  const payload = indexNowPayload(
    [
      `${ORIGIN}/posts/a`,
      `${ORIGIN}/posts/a`,
      "https://elsewhere.test/posts/b",
      "not a url",
    ],
    { origin: ORIGIN },
  );
  assert.ok(payload);
  assert.equal(payload.host, "example.test");
  assert.equal(payload.key, INDEXNOW_KEY);
  assert.equal(payload.keyLocation, `${ORIGIN}/${INDEXNOW_KEY}.txt`);
  assert.deepEqual(payload.urlList, [`${ORIGIN}/posts/a`]);
});

test("indexnow payload is null when nothing is eligible", () => {
  assert.equal(indexNowPayload(["https://elsewhere.test/a"], { origin: ORIGIN }), null);
  assert.equal(indexNowPayload([], { origin: ORIGIN }), null);
});

test("indexnow never submits outside production", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
    return new Response(null, { status: 200 });
  };
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  try {
    assert.equal(
      await submitUrls([`${ORIGIN}/posts/a`], { origin: ORIGIN, fetchImpl: fakeFetch }),
      false,
    );
    assert.equal(called, false);
  } finally {
    process.env.NODE_ENV = previous;
  }
});
