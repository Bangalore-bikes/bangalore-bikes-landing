import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const origin = "https://bangalorebikes.com";
const guideRoutes = JSON.parse(
  readFileSync(
    new URL("../src/data/wiki-guides.json", import.meta.url),
    "utf8",
  ),
).map((guide) => "/wiki/" + guide.slug);
const routes = [
  "/",
  "/wiki",
  "/contact",
  "/join",
  "/rides",
  "/blogs",
  "/destinations",
  "/maintenance",
  "/maintenance/garages",
  "/maintenance/sos",
  ...guideRoutes,
];
const indexed = [
  "/",
  "/wiki",
  "/contact",
  "/join",
  "/destinations",
  "/maintenance",
  "/maintenance/garages",
  ...guideRoutes,
];
const htmlFor = (path) =>
  readFileSync(
    new URL(
      "../.next/server/app/" +
        (path === "/" ? "index" : path.slice(1)) +
        ".html",
      import.meta.url,
    ),
    "utf8",
  );

test("every public page has its own title, canonical URL, and social preview", () => {
  const titles = new Set();
  for (const route of routes) {
    const html = htmlFor(route);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, route + " is missing a title");
    assert.ok(!titles.has(title), route + " reuses another page title");
    titles.add(title);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const socialUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
    assert.ok(canonical, route + " canonical missing");
    assert.ok(socialUrl, route + " social URL missing");
    assert.equal(
      new URL(canonical).href,
      new URL(origin + route).href,
      route + " canonical mismatch",
    );
    assert.equal(
      new URL(socialUrl).href,
      new URL(origin + route).href,
      route + " social URL mismatch",
    );
    assert.ok(
      html.includes('name="twitter:card" content="summary_large_image"'),
      route + " social card missing",
    );
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(image, route + " preview image missing");
    assert.equal(
      new URL(image).origin,
      origin,
      route + " preview image is served from another host",
    );
  }
});

test("unfinished pages are noindex and sitemap contains only populated routes", () => {
  const sitemap = readFileSync(
    new URL("../.next/server/app/sitemap.xml.body", import.meta.url),
    "utf8",
  );
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const detailPrefix = origin + "/destinations/";
  const detailUrls = urls.filter((url) => url.startsWith(detailPrefix));
  assert.ok(
    detailUrls.length > 100,
    "sitemap should list the per-destination pages",
  );
  for (const url of detailUrls) {
    const slug = url.slice(detailPrefix.length);
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, slug + " is not a clean slug");
    const page = htmlFor("/destinations/" + slug);
    assert.ok(
      page.includes('rel="canonical" href="' + url + '"'),
      slug + " canonical mismatch",
    );
  }
  assert.deepEqual(
    urls.filter((url) => !url.startsWith(detailPrefix)).sort(),
    indexed.map((route) => origin + route).sort(),
  );
  for (const route of routes.filter((route) => !indexed.includes(route))) {
    assert.ok(
      htmlFor(route).includes('name="robots" content="noindex, follow"'),
      route + " is accidentally indexable",
    );
  }
});

test("robots advertises the production sitemap", () => {
  const robots = readFileSync(
    new URL("../.next/server/app/robots.txt.body", import.meta.url),
    "utf8",
  );
  assert.ok(robots.includes("Sitemap: " + origin + "/sitemap.xml"));
  assert.ok(robots.includes("Allow: /"));
});

test("not-found page offers recovery and is excluded from search", () => {
  const html = readFileSync(
    new URL("../.next/server/app/_not-found.html", import.meta.url),
    "utf8",
  );
  assert.ok(html.includes("Page not found"));
  assert.ok(html.includes("Back to the homepage"));
  assert.ok(html.includes('name="robots" content="noindex"'));
});
