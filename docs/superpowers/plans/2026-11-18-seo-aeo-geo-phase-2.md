# Phase 2: SEO, AEO and GEO Foundation — Implementation Plan

**Goal:** Make every public page machine-readable for search engines and answer engines: complete structured data, a discovery file for language models, plain-markdown mirrors of long-form content, real social images, and instant indexing pings when a post is published.

**Architecture:** Pure builder functions in `src/lib/seo/` produce JSON-LD objects and text artefacts; routes and pages only place them. No new dependency, no paid service, no runtime database read on the hot path.

**Constraints:** Free tiers only. Structured data may only describe what the visible page shows. Markdown mirrors must be `noindex` with a canonical link back to the HTML page so they cannot compete with it.

## Why the shape is what it is

- **One sitemap, not an index.** The site serves fewer than 100 URLs; a sitemap index would add a hop without adding capacity. Revisit above roughly 5,000 URLs.
- **No `SearchAction`.** The site has no site-wide search endpoint that returns a result page, and claiming one that does not exist is a structured-data lie. `ItemList` is emitted instead on pages that genuinely list items.
- **No `aggregateRating` or `review`.** Nothing on the site collects ratings. Inventing them is the fastest route to a manual action.
- **Markdown mirrors are `noindex`.** They exist so a language model can read a clean document, not so they can rank. The canonical `Link` header and `<link rel="canonical">` point at the HTML page.
- **IndexNow key is public.** It is a proof-of-control file served from the site, not a secret. It is committed so every deployment serves it.

## Tasks

### 1. Structured data builders — `src/lib/seo/jsonld.ts`

- [ ] `organizationJsonLd()`: `Organization` with `@id` = `${siteOrigin}/#organization`, name, url, logo, sameAs (Reddit, WhatsApp invite).
- [ ] `websiteJsonLd()`: `WebSite` with `@id` = `${siteOrigin}/#website`, `publisher` pointing at the organization `@id`, `inLanguage: "en-IN"`.
- [ ] `guideArticleJsonLd(guide)`: `Article` for a wiki guide — headline, description, url, `isPartOf` the website, publisher, `dateModified` from `wikiImportedOn`.
- [ ] `itemListJsonLd({ name, items })`: ordered `ItemList` of `{ name, url }`.
- [ ] Re-export `breadcrumbJsonLd`, `jsonLdScript` from `post-jsonld.ts` so callers have one import.

### 2. Emit site-wide entities — `src/app/layout.tsx`

- [ ] One `<script type="application/ld+json">` in `<body>` carrying organization + website.

### 3. Per-page structured data

- [ ] `wiki/[slug]/page.tsx`: `Article` + `BreadcrumbList` (Home → Handbook → guide).
- [ ] `wiki/page.tsx` (via `_wiki/page.tsx`): `ItemList` of the guides it lists.
- [ ] `destinations/page.tsx` (via `_destinations/page.tsx`): `ItemList` of visible destinations.

### 4. `/llms.txt`

- [ ] `src/app/llms.txt/route.ts` returns `text/plain; charset=utf-8`, a short description, then sections linking guides, destination archive, posts and the key policy pages. Generated from the same data the pages use, so it cannot drift.
- [ ] Add `/llms.txt` to `robots.ts` allow rules implicitly through `*`; no disallow entry.

### 5. Markdown mirrors

- [ ] `src/app/md/wiki/[slug]/route.ts` and `src/app/md/posts/[slug]/route.ts`.
- [ ] `Content-Type: text/markdown; charset=utf-8`, `Link: <html-url>; rel="canonical"`, `X-Robots-Tag: noindex`.
- [ ] 404 for unknown or unpublished slugs.
- [ ] Wiki mirrors render from the guide data; post mirrors render the stored Markdown body verbatim.

### 6. Social images — `src/app/og/route.tsx`

- [ ] `next/og` `ImageResponse`, 1200×630, query params `title`, `subtitle`, `kind`.
- [ ] Clamp lengths, escape nothing into HTML that is not text, cache for a year.
- [ ] Posts and guides point `openGraph.images` / `twitter.images` at it.

### 7. IndexNow

- [ ] `public/<key>.txt` containing the key.
- [ ] `src/lib/seo/indexnow.ts`: `submitUrls(urls)` posts to `https://api.indexnow.org/indexnow`, production-only, never throws, logs failure.
- [ ] Call from moderation approve and from submit when the post lands in `published`, with the post URL and `/posts`.

### 8. Audit script

- [ ] `scripts/seo-audit.mjs`: fetches a base URL and reports title, description, canonical, JSON-LD types, OG image and robots per route. Read-only, no dependency.

### 9. Tests — `tests/seo-foundation.test.mjs`

- [ ] JSON-LD builders produce the documented `@type`/`@id` shape and never emit rating fields.
- [ ] `llms.txt` body lists every guide URL exactly once.
- [ ] Markdown mirror builders produce front matter plus canonical URL.
- [ ] IndexNow payload shape, and that non-production is a no-op.

### 10. Docs and verification

- [ ] Update `docs/discoverability.md`.
- [ ] `npm test`, `npx tsc --noEmit`, `npx next lint`, `npm run validate:content`, `npx next build`.
- [ ] Deploy, then verify `/llms.txt`, a mirror, an OG image, JSON-LD in page source.

## Out of scope

- Domain attachment (owner decision).
- Per-destination pages, comparison pages, programmatic route pages — that is Phase 3.
- Backlink acquisition: cannot be manufactured from the codebase.
