#!/usr/bin/env node
/**
 * Read-only SEO audit of a running site.
 *
 * Usage:
 *   node scripts/seo-audit.mjs [base-url]
 *
 * Fetches the public routes and reports, per route: status, title length,
 * description length, canonical, JSON-LD @types, and whether a social image is
 * advertised. It never writes to the site and needs no credentials.
 */
const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://bangalorebikes.com")
  .replace(/\/+$/, "");

const routes = [
  "/",
  "/wiki",
  "/destinations",
  "/maintenance",
  "/posts",
  "/join",
  "/contact",
  "/llms.txt",
  "/sitemap.xml",
  "/robots.txt",
];

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? "";
}

function jsonLdTypes(html) {
  const types = new Set();
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(block[1].replace(/\\u003c/g, "<"));
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node?.["@type"]) types.add(node["@type"]);
        for (const child of node?.["@graph"] ?? []) {
          if (child?.["@type"]) types.add(child["@type"]);
        }
      }
    } catch {
      types.add("INVALID");
    }
  }
  return [...types].sort();
}

let problems = 0;

for (const route of routes) {
  const url = base + route;
  try {
    const response = await fetch(url, { redirect: "follow" });
    const body = await response.text();
    const isText = route.endsWith(".txt") || route.endsWith(".xml");

    if (isText) {
      console.log(`${String(response.status).padEnd(3)} ${route.padEnd(16)} ${body.length} bytes`);
      if (!response.ok) problems += 1;
      continue;
    }

    const title = match(body, /<title>([^<]*)<\/title>/);
    const description = match(body, /<meta name="description" content="([^"]*)"/);
    const canonical = match(body, /<link rel="canonical" href="([^"]*)"/);
    const ogImage = match(body, /<meta property="og:image" content="([^"]*)"/);
    const types = jsonLdTypes(body);

    const notes = [];
    if (response.status !== 200) notes.push(`status ${response.status}`);
    if (!title) notes.push("no title");
    else if (title.length > 65) notes.push(`title ${title.length} chars`);
    if (!description) notes.push("no description");
    else if (description.length > 165) notes.push(`description ${description.length} chars`);
    if (!canonical) notes.push("no canonical");
    else if (!canonical.startsWith(base)) notes.push("canonical on another host");
    if (!ogImage) notes.push("no og:image");
    if (types.length === 0) notes.push("no JSON-LD");

    if (notes.length > 0) problems += 1;
    console.log(
      `${String(response.status).padEnd(3)} ${route.padEnd(16)} ${(types.join(",") || "-").padEnd(34)} ${
        notes.length > 0 ? notes.join("; ") : "ok"
      }`,
    );
  } catch (error) {
    problems += 1;
    console.log(`ERR ${route.padEnd(16)} ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(problems === 0 ? "\nAll checked routes look complete." : `\n${problems} route(s) need attention.`);
process.exitCode = problems === 0 ? 0 : 1;
