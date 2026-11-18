# Bangalore Bikes: community publishing, SEO/AEO/GEO and community platform

- **Date:** 2026-11-17
- **Status:** accepted (design reviewed in conversation)
- **Owner:** Bangalore Bikes
- **Scope:** design for user-created blogs, the search/answer-engine programme,
  and the community features that sit on top of them.

## 1. Context

The site is a Next.js 15 App Router application deployed on Vercel and Netlify.
Content is validated with Zod and read either from repository JSON or, when
`TURSO_DATABASE_URL` is configured, from a libSQL database through the managed
content admin merged in PR #25.

Today there are no user accounts, no submission pipeline, no Markdown support,
no comments, no image storage and no rate limiting. Everything below adds those
without introducing a recurring cost.

## 2. Goals

1. Any rider can create an account with an email address and password, write a
   post in Markdown, and see it published.
2. Moderators can review, approve, reject and retract content, and the audit log
   records the real human who acted.
3. Posts, destinations, bike models, workshops and rides produce indexable pages
   with complete structured data.
4. The site renders well in AI answer engines (AEO) and generative results
   (GEO), not only in blue links.
5. Total recurring cost stays at zero at community scale.
6. Core Web Vitals pass and the interface meets WCAG 2.1 AA.

### Success criteria

- A new rider can sign up, verify, write and publish in under ten minutes at
  trust level 1.
- Every published page appears in `sitemap.xml`, carries one canonical URL and
  valid JSON-LD.
- No page is indexed while it is a draft, pending or rejected.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and
  `npm run test:seo` pass in CI for every phase.

## 3. Non-goals

- SMS one-time passwords (per-message cost).
- Paid CMS, paid image CDN, paid email provider, paid spam service.
- A third-party identity vendor holding the user table.
- Arbitrary MDX, JSX or scripts in user content.
- Comment threads deeper than one level.
- Multi-language indexing (Kannada/Hindi) in this scope.
- Mobile apps.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Hybrid trust: new authors are moderated, trusted authors auto-publish | Keeps quality and spam out without throttling proven contributors |
| D2 | Email + password only | Matches Team-BHP/xBHP expectations, no OAuth console work, no per-message cost |
| D3 | Markdown with a closed directive set, stored in the database | MDX-like authoring without executing contributor code; publishes without a rebuild |
| D4 | Sanitised HTML rendered once at submit, stored beside the Markdown source | No parsing on the request path; one sanitisation point |
| D5 | Posts get dedicated tables, not `content_records` | `content_records.collection` has a `CHECK` constraint; posts need ownership, five states, revisions and comments |
| D6 | Self-hosted Better Auth on libSQL | No MAU ceiling, one identity table, revocable server-side sessions |
| D7 | Resend free tier for verification and reset mail | 3,000/month, 100/day — far above expected volume |
| D8 | Cloudflare R2 free tier for images | 10 GB storage, no egress fee |
| D9 | Programmatic pages gated by data enrichment | Avoids publishing 109 thin pages from a 2010 spreadsheet |
| D10 | Structured data only where the visible page supports it | Fake ratings would breach Google policy and the site's own editorial stance |

## 5. Architecture

```
Browser
 ├─ /signup /login /verify /reset      auth pages
 ├─ /write /drafts /posts/[slug]/edit  authoring
 ├─ /moderation                        review queue
 ├─ /admin                             existing GitHub moderator panel (unchanged)
 └─ /api/*                             route handlers

Server
 ├─ lib/auth/*            Better Auth instance, session helpers, guards
 ├─ lib/posts/*           repository, schema, lifecycle, sanitised rendering
 ├─ lib/seo/*             JSON-LD builders, sitemap, feeds, llms.txt
 ├─ lib/rate-limit.ts     DB-backed counters
 └─ lib/mail.ts           Resend transport with a no-op fallback

Data
 ├─ Turso (libSQL)        users, sessions, tokens, posts, revisions, comments,
 │                        reactions, reviews, uploads, rate limits, FTS index
 ├─ Cloudflare R2        post images
 └─ Resend               transactional email
```

Every external service has a no-op or local fallback so builds, tests and
unconfigured deployments keep working — the same pattern the content store
already uses.

## 6. Data model

### users

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | ULID |
| `email` | text unique | stored lowercased |
| `email_verified_at` | text null | ISO timestamp |
| `password_hash` | text | argon2id |
| `handle` | text unique | URL-safe, immutable after first post |
| `display_name` | text | |
| `bio` | text null | max 500 |
| `avatar_url` | text null | R2 or allowlisted host |
| `role` | text | `rider` \| `moderator` |
| `trust_level` | integer | 0 new, 1 trusted, 2 veteran |
| `approved_count` | integer | drives promotion |
| `rejected_count` | integer | drives demotion |
| `disabled_at` | text null | soft ban |
| `created_at` | text | |

### posts

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | ULID |
| `slug` | text unique | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 80 |
| `title` | text | 8–120 chars |
| `summary` | text | 40–60 words, rendered as TL;DR |
| `body_md` | text | source of truth, max 60 KB |
| `body_html` | text null | sanitised, generated |
| `cover_image_url` | text null | |
| `tags` | text | JSON array, max 5 |
| `author_id` | text | FK users |
| `status` | text | `draft` \| `pending` \| `published` \| `rejected` \| `unpublished` |
| `published_at` | text null | |
| `updated_at` | text | |
| `version` | integer | optimistic concurrency |
| `moderation_note` | text null | visible to the author |
| `search_text` | text | normalised, feeds FTS |

### supporting tables

- `post_revisions(id, post_id, version, title, summary, body_md, editor_id, created_at)`
- `post_comments(id, post_id, author_id, parent_id, body_md, body_html, status, created_at, deleted_at)`
- `post_reactions(post_id, user_id, kind, created_at)` — unique per user/kind
- `workshop_reviews(id, workshop_slug, author_id, rating, body, visit_month, status, created_at)`
- `rate_limits(key, window_start, count)` — primary key `(key, window_start)`
- `uploads(id, post_id, object_key, mime, bytes, uploaded_by, created_at)`
- `posts_fts` — FTS5 virtual table over `title, summary, body_md, tags`

## 7. Authentication flows

**Signup.** Email + password (min 12 chars, checked against a small common-password
deny list). Account is created unverified; a verification mail is sent. Unverified
users may draft but not publish or comment.

**Verification.** Single-use token, hashed at rest, 24-hour expiry.

**Login.** Argon2id verification, constant-time failure response, throttle of
5 attempts per account and 20 per IP per 15 minutes. Sessions are rows in
`sessions` with an opaque token in an `httpOnly`, `Secure`, `SameSite=Lax`
cookie; sliding 30-day expiry; revocable individually and globally.

**Password reset.** Single-use token, 1-hour expiry, invalidates all sessions on
use. Response is identical whether or not the address exists.

**Guards.** `requireUser()` and `requireModerator()` mirror the existing
`requireAdmin()` contract and are called inside every route handler, never only
in middleware.

Moderators bootstrap through an `ADMIN_EMAILS` environment variable. The GitHub
panel keeps working unchanged until phase 6 unifies both onto the new users table.

## 8. Post lifecycle

```
draft ──submit──▶ pending ──approve──▶ published ──unpublish──▶ unpublished
                     │                    │                         │
                     └──reject──▶ rejected └──edit──▶ pending ◀──────┘
```

- Saving always produces a `draft` plus a revision row.
- Submitting renders and sanitises HTML. Rendering failure returns the author to
  the editor with a field-level error; nothing is stored half-rendered.
- Trust level 0 → `pending`. Trust level ≥1 → `published` with `published_at`.
- Moderator transitions require a note for rejection.
- Promotion at 3 approved posts; demotion after 2 rejections. Both reversible.
- Every transition writes to `content_audit` with the user id as actor.
- Only `published` rows are visible to readers, feeds, search and sitemaps.

## 9. Rendering

Pipeline: `remark-parse` → `remark-gfm` → `remark-directive` → custom directive
handlers → `remark-rehype` → `rehype-sanitize` (strict allowlist) → `rehype-slug`
→ `rehype-stringify`.

Allowed directives: `callout`, `gallery`, `map`, `faq`. No raw HTML nodes reach
the tree. Heading IDs are generated for the table of contents. External links
receive `rel="noopener nofollow ugc"`.

The renderer is pure and unit-tested: headings, GFM tables, links, images,
directives, script tags stripped, `javascript:` URLs stripped, attribute
injection attempts neutralised.

## 10. SEO, AEO and GEO

### Metadata
Per-page title (≤60 chars target), description (140–160), self canonical, OG and
Twitter cards, accurate `dateModified`, preview deployments `noindex`.

### Structured data
- Sitewide: `Organization` (`sameAs`, `areaServed`), `WebSite` + SearchAction.
- Post: `BlogPosting`, `Person`, `BreadcrumbList`.
- Bike model: `Motorcycle`, `BreadcrumbList`, `FAQPage`.
- Destination: `TouristAttraction`, `BreadcrumbList`, `FAQPage`.
- Workshop: `AutoRepair`; `Review`/`AggregateRating` only with real reviews.
- Ride: `Event` with `eventStatus` and `eventAttendanceMode`.

FAQ and HowTo rich results are largely retired by Google; the markup is kept for
answer-engine extraction and documented as such.

### Discovery artefacts
- Sitemap index with child sitemaps and honest `lastmod`.
- `llms.txt` index of canonical pages.
- Markdown mirror at `?format=md` with a canonical `Link` header.
- RSS 2.0 and JSON Feed.
- IndexNow ping on publish.
- `robots.ts` explicitly allows AI crawlers, blocks `/admin`, `/moderation`,
  `/api` and draft surfaces.

### Answer-first conventions
- Required summary rendered as a TL;DR block.
- Key-facts tables for bikes, destinations and workshops.
- FAQ blocks at the end of substantive pages.
- Visible author byline, bio and credentials (E-E-A-T).

## 11. Programmatic pages

**Destinations.** 109 historical records exist but the source states it has not
been updated since 2010. A page publishes only when it clears an enrichment
threshold: distance, direction, road condition, food, lodging, best months and at
least one current note. Remaining records stay unpublished until community posts
tagged to them supply the missing substance. Published hubs aggregate those posts.

**Bike models.** A repository dataset with a source URL required per factual
field, enforced by `npm run validate:content`. Start with 25–40 popular Bangalore
models. Unsupported fields render as absent, never guessed.

**Workshops.** A page requires at least three genuine member reviews.

## 12. Visual design

- Two-font system: Space Grotesk for UI and display, one reading serif for post
  bodies.
- Charcoal and dixie amber carry over from the existing tokens.
- Full-bleed covers, restrained ratios, no decorative gradients.
- Post cards: cover, title, author, reading time, tag.
- Reading page: sticky table of contents on desktop, ~68ch measure, visible
  updated date.
- Motion through existing view transitions, respecting `prefers-reduced-motion`.
- WCAG AA in both themes, 44px minimum touch targets, no image-driven layout
  shift.
- Imagery from contributor uploads and Unsplash. Reddit imagery is used only
  where the poster is the author or a moderator has confirmed permission, and is
  always attributed.

## 13. Phases

| # | Phase | Acceptance |
|---|---|---|
| 1 | Identity and publishing core | Signup/verify/login/reset; editor with preview; drafts; moderation queue; trust transitions; sanitised render; `/posts`, `/posts/[slug]`, `/writers/[handle]`; RSS |
| 2 | SEO/AEO foundation | JSON-LD on every route; sitemap index; `llms.txt`; markdown mirrors; OG images; robots policy; IndexNow; SEO health view |
| 3 | Programmatic pages | Destination hubs behind the enrichment gate; bike dataset with per-field sources; workshop threshold pages; breadcrumb and related-links system |
| 4 | Community | Comments, reactions, badges, leaderboard, follows, R2 uploads |
| 5 | Ride and workshop depth | RSVP, GPX, galleries, reviews with schema |
| 6 | Discovery and operations | FTS5 search, topic hubs, weekly digest, scheduling, revision diffs, admin auth unification |

## 14. Cost model

| Service | Free tier used | Expected usage |
|---|---|---|
| Vercel / Netlify | free plan | existing |
| Turso | free plan | < 1% |
| Resend | 3,000/month, 100/day | tens per month |
| Cloudflare R2 | 10 GB | < 1 GB |
| Domain, DNS | existing | unchanged |

No new paid dependency is introduced. Each service degrades to a fallback when
unconfigured.

## 15. Risks

| Risk | Mitigation |
|---|---|
| Spam and low-quality posts | Trust gating, throttles, moderation queue, manual and automated demotion |
| XSS through Markdown | Closed directive set, no raw HTML, strict sanitiser, unit tests |
| Thin programmatic pages | Enrichment threshold, noindex until met |
| Stolen images | Upload-driven by default, permission and attribution policy |
| Vendor lock-in | All data in libSQL; auth and mail adapters are swappable |
| Local build limits | CI remains the authoritative build |
| Moderation load | Auto-publish at trust 1, digest of the review queue, simple one-key actions |

## 16. Verification

- Unit tests for the renderer, lifecycle transitions, throttles, slug rules and
  JSON-LD builders.
- Route-handler tests with an injected SQLite database, as the content store
  already does.
- `npm run test:seo` extended to assert canonical URLs, JSON-LD presence and
  sitemap membership for published posts.
- Accessibility checks in the existing browser smoke suite.
- CI build plus Lighthouse budget for LCP and CLS on the post page.

## 17. Open questions

1. Reading serif choice — decide during phase 1 with real posts, defaulting to
   Newsreader.
2. Whether the weekly digest is opt-in only (proposed) or on by default.
3. How long an unverified account may keep drafts before expiry (proposed: 30
   days, then purge).
