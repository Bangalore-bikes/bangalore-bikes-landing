import assert from "node:assert/strict";
import test from "node:test";

import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from "../src/lib/seo/post-jsonld.ts";

const post = {
  id: "post-1",
  slug: "nandi-hills-before-sunrise",
  title: "Nandi Hills before sunrise",
  summary:
    "Leaving Hebbal at five, what to carry, and where the road turns rough before the climb.",
  bodyMd: "## The start\n\nWe rolled out at five in the morning and the road was empty.",
  bodyHtml: "<h2>The start</h2>",
  coverImageUrl: "https://example.com/cover.jpg",
  tags: ["rides", "nandi-hills"],
  authorId: "user-1",
  status: "published",
  publishedAt: "2026-11-01T04:30:00.000Z",
  createdAt: "2026-10-28T10:00:00.000Z",
  updatedAt: "2026-11-02T09:00:00.000Z",
  version: 4,
  moderationNote: null,
  author: {
    id: "user-1",
    handle: "asha-rao",
    displayName: "Asha Rao",
    avatarUrl: null,
    trustLevel: 1,
  },
};

test("BlogPosting carries the fields Google and answer engines read", () => {
  const value = blogPostingJsonLd(post);
  assert.equal(value["@type"], "BlogPosting");
  assert.equal(value.headline, post.title);
  assert.equal(value.description, post.summary);
  assert.equal(value.datePublished, post.publishedAt);
  assert.equal(value.dateModified, post.updatedAt);
  assert.deepEqual(value.mainEntityOfPage, {
    "@type": "WebPage",
    "@id": "https://bangalorebikes.com/posts/nandi-hills-before-sunrise",
  });
  assert.equal(value.author.name, "Asha Rao");
  assert.equal(value.author.url, "https://bangalorebikes.com/writers/asha-rao");
  assert.equal(value.publisher.name, "Bangalore Bikes");
  assert.equal(value.inLanguage, "en-IN");
  assert.equal(value.isAccessibleForFree, true);
  assert.deepEqual(value.image, ["https://example.com/cover.jpg"]);
  assert.match(String(value.timeRequired), /^PT\d+M$/);
});

test("no rating or engagement claims are invented", () => {
  const value = blogPostingJsonLd(post);
  const serialised = JSON.stringify(value);
  assert.doesNotMatch(serialised, /aggregateRating|ratingValue|interactionStatistic/);
});

test("breadcrumbs are ordered and absolute", () => {
  const value = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Rider posts", path: "/posts" },
    { name: "Nandi Hills", path: "/posts/nandi-hills-before-sunrise" },
  ]);
  const items = value.itemListElement;
  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map((item) => item.position),
    [1, 2, 3],
  );
  assert.equal(items[2].item, "https://bangalorebikes.com/posts/nandi-hills-before-sunrise");
});

test("the script payload cannot close its own tag", () => {
  const payload = jsonLdScript({ value: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(payload, /<\/script>/i);
  assert.equal(JSON.parse(payload).value, "</script><script>alert(1)</script>");
});
