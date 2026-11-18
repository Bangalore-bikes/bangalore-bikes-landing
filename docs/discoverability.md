# Search, answer engines and social previews

The canonical origin follows `NEXT_PUBLIC_SITE_URL` in [siteMetadata.ts](../src/lib/siteMetadata.ts); it falls back to `https://bangalorebikes.com` only for local builds without the variable. Every URL the site emits itself — sitemap, robots, JSON-LD, Open Graph, RSS, mail links — uses that origin, so a deployment never advertises a host that does not serve it.

## What each layer does

| Layer | Where | Purpose |
| --- | --- | --- |
| Per-route metadata | `createPageMetadata()` and page `generateMetadata()` | Title, description, canonical, robots policy |
| Organization + WebSite JSON-LD | [layout.tsx](../src/app/layout.tsx) | Tells crawlers who publishes the site and what it is called |
| Article + BreadcrumbList JSON-LD | [wiki/[slug]](../src/app/(with-root-layout)/wiki/[slug]/page.tsx) | Makes a guide eligible for article-style results |
| BlogPosting JSON-LD | [posts/[slug]](../src/app/(with-root-layout)/posts/[slug]/page.tsx) | Same for rider posts, with real author and dates |
| ItemList JSON-LD | `/wiki` and `/posts` | Describes the list the page actually shows |
| `/llms.txt` | [llms.txt/route.ts](../src/app/llms.txt/route.ts) | A short map of the site for language models, generated from live data |
| Markdown mirrors | `/md/wiki/[slug]`, `/md/posts/[slug]` | A clean document for a model to read; `noindex`, canonical points at the HTML page |
| Generated social cards | `/og?title=…&subtitle=…&kind=…` | 1200×630 image per guide and post, no per-page asset |
| IndexNow | [indexnow.ts](../src/lib/seo/indexnow.ts) | Pings search engines the moment a post is published |
| Sitemap | [sitemap.ts](../src/app/sitemap.ts) | Every indexable URL, including published posts |
| Audit | `node scripts/seo-audit.mjs [base-url]` | Read-only report of status, title, description, canonical, JSON-LD and social image per route |

## Deliberate omissions

- **No sitemap index.** The site serves far fewer than the 50,000-URL sitemap limit; an index would add a hop and solve nothing.
- **No `SearchAction`.** There is no site-wide search results page, and structured data must describe a real capability.
- **No ratings or reviews.** The site does not collect them. Emitting `aggregateRating` without real reviews is a fast route to a manual action.
- **No separate indexable copies.** Markdown mirrors are `noindex` and send `Link: <html>; rel="canonical"`, so they serve models without competing with the page that should rank.

## Indexing behaviour

The homepage, handbook, destination archive, maintenance pages and contact page are indexable and appear in the sitemap. Ride and story indexes become indexable automatically when their collections are populated. Published article, ride and rider-post URLs are added with update timestamps. Empty sections stay accessible with `noindex` and stay out of the sitemap.

Preview deployments (`VERCEL_ENV` other than `production`, or Netlify preview/branch contexts) receive `noindex`, crawler exclusion and an empty sitemap. IndexNow refuses to submit outside production for the same reason.

The not-found page offers a homepage link and keeps Next.js's `noindex` behaviour.

## Verification

```
npm run test:seo
npm test
node scripts/seo-audit.mjs https://bangalorebikes.vercel.app
```

Output tests inspect generated HTML, sitemap and robots files. Policy tests check production and both preview contexts. `tests/seo-foundation.test.mjs` covers the JSON-LD builders, the `llms.txt` document, both markdown mirrors and the IndexNow payload, including the production-only gate.

These checks verify output, not ranking. Indexing still requires the domain to be attached, the sitemap to be submitted in Search Console and Bing Webmaster Tools, and other sites to link here.
