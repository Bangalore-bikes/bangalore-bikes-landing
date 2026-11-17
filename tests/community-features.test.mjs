import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { communityLinks } from "../src/lib/community.ts";
import { parseRedditFeed } from "../src/lib/communityFeed.ts";

test("both published QR images scan to the exact owner-supplied WhatsApp invites", () => {
  for (const [name, target] of [
    ["whatsapp-invite", communityLinks.whatsapp],
    ["whatsapp-short-invite", communityLinks.whatsappShort],
  ]) {
    const png = PNG.sync.read(
      readFileSync(new URL("../public/" + name + ".png", import.meta.url)),
    );
    const decoded = jsQR(
      new Uint8ClampedArray(png.data),
      png.width,
      png.height,
    );
    assert.equal(
      decoded?.data,
      target,
      name + " must be scannable and point at the real invite",
    );
  }
});

const entry = (
  url,
  title = "A breakfast ride",
  date = "2026-11-17T07:00:00+05:30",
) =>
  `<entry><id>t3_abc123</id><title>${title}</title><author><name>/u/test-rider</name></author><link href="${url}"/><updated>${date}</updated></entry>`;
const feed = (...entries) =>
  `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">${entries.join("")}</feed>`;

test("community feed parses posts and timestamps without rendering remote HTML", () => {
  const posts = parseRedditFeed(
    feed(
      entry(
        "https://www.reddit.com/r/bangalorebikes/comments/abc123/ride/",
        "Ride &amp; coffee &lt;script&gt;",
      ),
    ),
  );
  assert.equal(posts.length, 1);
  assert.equal(posts[0].title, "Ride & coffee <script>");
  assert.equal(posts[0].author, "test-rider");
  assert.equal(posts[0].publishedAt, "2026-11-17T01:30:00.000Z");
});

test("community feed rejects unsafe/cross-community links, invalid dates, duplicates and explicit NSFW posts", () => {
  const safe = "https://www.reddit.com/r/bangalorebikes/comments/abc123/ride/";
  const posts = parseRedditFeed(
    feed(
      entry(safe),
      entry(safe),
      entry("javascript:alert(1)"),
      entry("https://www.reddit.com/r/another/comments/abc123/"),
      entry(
        "https://www.reddit.com.evil.invalid/r/bangalorebikes/comments/abc123/",
      ),
      entry(safe + "bad", "Bad date", "not a date"),
      entry(safe + "adult", "[NSFW] post"),
    ),
  );
  assert.equal(posts.length, 1);
  assert.throws(() =>
    parseRedditFeed('<!DOCTYPE feed [<!ENTITY bomb "x">]><feed/>'),
  );
  assert.throws(() => parseRedditFeed("<html>Access denied</html>"));
});
