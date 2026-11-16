# Bangalore Bikes community hub

Status: community foundation, initial resource search, discoverability, and ride foundation implemented on codex/community-foundation. Real ride publication and editorial integrations remain pending.
Date: 2026-11-16

## Purpose

Make useful r/BangaloreBikes information easy to find and act on. Reddit stays the home for discussion and moderation. The website organizes approved rides, durable resources, and community entry points. Serve riders across motorcycle brands; the existing Royal Enfield-specific language is not the community's product definition.

Success means a visitor can find the next confirmed ride, open its Reddit discussion, locate a relevant resource, and contact moderators without encountering fictional claims or dead controls.

## Source audit

Initial baseline findings, before the foundation work below. These are not a claim that all listed defects remain present.

- Home ride cards are hard-coded examples without dates or destination links. The rides page advertises January/February 2024 events as upcoming, with invented participation counts and registration buttons that do nothing.
- Blog cards have invented posts and nonfunctional reading actions. Exposing /blogs fixes routing, not editorial publishing or Notion integration.
- Wiki search and article buttons do not retrieve articles. Article/view counts are sample content.
- Contact submission logs personal information, clears the form, and does not deliver the message. Phone support, response-time promises, and office hours are not established facts.
- SOS advertises a placeholder community emergency hotline and unverified service numbers. Do not present these as operational services.
- Mobile Join Us has no destination. Icon-only navigation lacks a descriptive label; social links point to #.
- Route wrappers and duplicate-chrome cleanup are in the pending PR; these are infrastructure fixes, not completion of the rides/wiki/blog product requirements.
- Storybook currently has button/card examples, not complete typography, palette, or design-language documentation.
- Closed draft PR #15 contains Notion integration work that is not reproduced by the route wrappers. Preserve it as reference; do not claim it was functionally replaced.

## Recommended first-release experience

Navigation: Home, Rides, Resources, About/contact, Join r/BangaloreBikes.

Home order:

1. Short community introduction and Join on Reddit action.
2. Next confirmed ride with local date/time, distance, departure area, organizer, status, and Reddit discussion link. Show an honest no-upcoming-rides state when empty.
3. Moderator-selected discussions: title, short moderator-written context, original Reddit link. No scraped comment bodies or fabricated engagement metrics.
4. Resource categories: destinations, maintenance, beginner guidance, riding etiquette, garages, and transport/shipping.
5. Contribution and moderator-contact links.

Resources are searchable locally, with source links and last-reviewed dates. Community recommendations are attributed as recommendations, not guaranteed endorsements. Never invent emergency contacts, garage ratings, or availability. Publish a contact only after its official source and intended use are checked.

## Integration choices

| Integration | First release | Later |
| --- | --- | --- |
| Reddit | Normal source links, subreddit join link, moderator contact through Reddit modmail | Approved API/Devvit integration after access and deletion/update behavior are established |
| Content editing | Versioned typed content in the repository, reviewed through PRs | Notion or another editor only if moderators need non-Git publishing |
| Maps | External destination/directions links with a textual destination | Interactive maps only when route exploration justifies them |
| Calendar | Downloadable calendar event for confirmed rides | Subscription feed after an owner maintains event updates/cancellations |
| Ride participation | Original Reddit discussion or moderator-approved registration destination | Dedicated RSVP only with agreed organizer workflow, retention, and access rules |
| Contact | Reddit modmail; no fake delivery confirmation | Server-backed form only if a monitored inbox and delivery provider are selected |

No credentials, new paid services, automatic posts, Reddit login, or moderator actions are needed for release one.

Reddit access is not assumed: https://redditinc.com/policies/developer-terms and https://redditinc.com/news/modernizing-reddits-infrastructure-and-moderation-tools describe the current developer-service direction. Verify the available integration route before implementing automated ingestion. Keep a curated-content fallback.

## Architecture

Keep Next.js App Router, existing UI primitives, and Netlify. Do not introduce a database just for a curated directory.

Use a shared content layer, validated with the existing Zod dependency, for:

- Ride: stable ID/slug, title, ISO start timestamp with offset, Asia/Kolkata display timezone, departure area, destination, distance, organizer display name, confirmation/cancellation state, Reddit URL, optional approved directions link, last reviewed date.
- Resource: slug, title, category, moderator-written summary, source URL, last reviewed date, optional area/tags.
- Community selection: title, Reddit URL, moderator-written context, editorial ordering.

Homepage and index/detail pages consume the same entries. No duplicate hand-maintained ride lists. Derive upcoming/past status from the start timestamp; cancellation takes precedence. Unknown information stays omitted. Public departure information must be approved for publication.

All external destinations are validated as HTTPS URLs, and Reddit links are restricted to approved Reddit hosts. Invalid content fails validation before deployment. Secrets, if later required, stay server-only.

## Delivery sequence

### 1. Credible community foundation

Fix mobile joining/navigation labels and placeholder social links. Replace fake contact delivery with modmail. Remove fictional emergency/community-service claims and brand-exclusive language. Replace sample rides/posts/counts with truthful empty states or approved content. Leave the current pending PR unchanged; ship this as a separate follow-up.

Acceptance: every visible action has a real destination or an explicit unavailable state; no demo event or support promise is presented as real.

### 2. Curated resources and discussions

Introduce the validated content layer and resource search/filter. Show last-reviewed dates and source links. Select the first real resources with moderators; do not copy Reddit authors' posts into articles without permission.

Acceptance: shared source data drives homepage and directory; search has clear empty/reset states; all selected discussions open their original threads.

### 3. Confirmed rides

Add ride details, cancellation/expired states, approved directions links, and calendar downloads. Gather organizer-approved ride records before publishing events.

Acceptance: expired rides never appear as upcoming; local-time/calendar behavior and cancelled events are tested; no RSVP count is invented.

### 4. Moderator publishing integration

Choose Git, Notion, or an approved Reddit integration based on who actually maintains the site. Evaluate the old Notion PR for reusable pieces rather than merging its whole draft blindly. Add caching, failure fallbacks, content removal handling, and operational ownership for whichever integration is chosen.

### 5. Discoverability and upkeep

Page-specific metadata, social previews, sitemap/robots, useful not-found states, documented content maintenance, dependency updates, and build checks. Finish Storybook palette/type/interaction coverage. Analytics is optional and needs an actual question to answer, such as which resource categories visitors use.

## Verification

Meaningful automated checks cover content validation, ride time boundaries/cancellations, search behavior, and calendar encoding. Browser smoke checks cover mobile joining, navigation, source links, empty states, keyboard focus, responsive layouts, and contact behavior. Run lint, type checking, production build, and Storybook build for relevant changes. A successful build alone does not establish that an issue's feature requirements are complete.

## Inputs needed before real-content publication

- Moderator-approved initial ride/discussion/resource links.
- Confirmation of any official external social accounts or group invite URLs.
- A named content maintainer and the preferred editing workflow.

These inputs do not block navigation, empty-state, fake-content, or contact-flow cleanup.

## Milestone 1 implementation

- Replaced fabricated events, articles, destination ratings, garage listings, and resource counts with explicit unpublished-content states.
- Removed the contact form that discarded messages and replaced it with Reddit modmail.
- Removed the purported community emergency hotline and unverified assistance numbers.
- Fixed joining on mobile and desktop, added a menu label, closed mobile navigation on link selection, and removed placeholder social links.
- Preserved the existing theme and public routes; shared content states use existing UI primitives.
- No Reddit API integration, publishing backend, verified directory, or real event calendar is claimed by this release.

## Subsequent local feature work

- Seeded three attributed Reddit links with shared homepage/directory rendering; added local search and category filters.
- Added per-page metadata, production sitemap and crawler rules, preview indexing exclusions, and a helpful 404.
- Added validated shared ride data, state-aware listings, detail routes, organizer directions, and UTC ICS snapshots with IST displays. See [rides.md](./rides.md) for publication requirements.
- The published ride collection remains empty. No real event or RSVP flow is claimed.
- The community foundation was merged in PR #20. The owner has authorized pushing and merging subsequent verified work without requesting reviews.
- Content is edited through validated JSON collections, with resource draft/published states, visible source-check dates, duplicate detection, and a local validation command. Draft filtering occurs before data is passed to interactive components.
- Resources have prefilled correction links to Reddit modmail; they never send messages automatically.
- Storybook now builds with the compatibility launcher and pinned webpack. It includes resource states, typography/palette examples, and a light/dark toolbar.
- Focused browser smoke checks cover mobile navigation, joining, resource filters/reset, contact/correction links, overflow, and unknown ride/calendar routes. Full visual regression and accessibility auditing remain outstanding.
- Added repository-backed articles with draft exclusion, author/permission metadata, structured text rendering, archive/detail pages, homepage placement, and automatic sitemap/indexing behavior. The article collection remains empty until content is supplied.
- Added isolated Storybook ride-state and article previews. The extended Chrome suite verifies calendar visibility for all four ride states and literal-text rendering; those populated-state smoke checks now pass.
- Added a keyboard skip-to-content link, a homepage main landmark, and responsive/priority hints for the above-fold banner. Full accessibility auditing and visual regression remain separate work.

## Automated upkeep

- Added a read-only GitHub Actions workflow for locked dependency installation, content validation, unit tests, lint, typechecking, production build, generated SEO checks, Storybook build and actual Chrome interactions.
- Both hosting targets remain intact: bangalorebikes.com is primary and bangalorebikes.vercel.app is secondary/staging. The workflow does not modify DNS or hosting configuration.
- Real content, any non-Git publishing integration, full accessibility auditing and visual regression remain outstanding; build automation does not claim to deliver those features.
