import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown } from "../src/lib/markdown/render.ts";
import { collectHeadings } from "../src/lib/markdown/toc.ts";

test("contents labels use parsed text, including nested markup and character references", () => {
  assert.deepEqual(
    collectHeadings(
      '<h2 id="route">A <em>ride</em> &#x1f3cd; &amp; &#169;</h2><h3 id="warning">&lt;script&gt; stays text</h3>',
    ),
    [
      { id: "route", text: "A ride 🏍 & ©", level: 2 },
      { id: "warning", text: "<script> stays text", level: 3 },
    ],
  );
});

test("headings, lists and GFM tables render with a table of contents", async () => {
  const { html, headings } = await renderMarkdown(
    "## Ride report\n\n- one\n- two\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n### The climb\n\nText.\n",
  );
  assert.match(html, /<h2 id="user-content-ride-report">Ride report<\/h2>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<table>/);
  assert.deepEqual(headings, [
    { id: "user-content-ride-report", text: "Ride report", level: 2 },
    { id: "user-content-the-climb", text: "The climb", level: 3 },
  ]);
});

test("script tags, event handlers and javascript urls are neutralised", async () => {
  const { html } = await renderMarkdown(
    '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[x](javascript:alert(1))\n\n[ok](https://example.com)\n',
  );
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /onerror/i);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /<img[^>]*src=/i);
});

test("unknown and malformed directives stay as readable text", async () => {
  const { html } = await renderMarkdown(":::galery\nhello\n:::");
  assert.match(html, /galery/);
  assert.match(html, /hello/);
});

test("callouts become an aside with a validated kind", async () => {
  const { html } = await renderMarkdown(
    ":::callout{type=warning}\nWatch the gravel.\n:::\n\n:::callout{type=evil}\nFine.\n:::",
  );
  assert.match(html, /<aside data-callout="warning">/);
  assert.match(html, /Watch the gravel/);
  assert.match(html, /<aside data-callout="note">/);
  assert.doesNotMatch(html, /data-callout="evil"/);
});

test("galleries become a figure and map directives become a plain link", async () => {
  const gallery = await renderMarkdown(
    ":::gallery\n![one](https://example.com/1.jpg)\n:::",
  );
  assert.match(gallery.html, /<figure data-gallery="">/);
  assert.match(gallery.html, /src="https:\/\/example.com\/1.jpg"/);

  const map = await renderMarkdown(':::map{place="Nandi Hills"}');
  assert.match(map.html, /openstreetmap\.org\/search\?query=Nandi%20Hills/);
  assert.doesNotMatch(map.html, /<iframe/i);
});

test("faq directives become accessible disclosure blocks", async () => {
  const { html } = await renderMarkdown(
    ":::faq\n### Is it safe for a beginner?\nYes, at a steady pace.\n:::\n",
  );
  assert.match(html, /<section data-faq="">/);
  assert.match(html, /<details>/);
  assert.match(html, /<summary>Is it safe for a beginner\?<\/summary>/);
  assert.match(html, /Yes, at a steady pace/);
});

test("external links are hardened and relative links are kept", async () => {
  const { html } = await renderMarkdown(
    "[outside](https://example.com/a) and [inside](/rides)",
  );
  assert.match(html, /rel="noopener nofollow ugc"/);
  assert.match(html, /href="\/rides"/);
});
