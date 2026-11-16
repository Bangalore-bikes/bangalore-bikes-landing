# Community content maintenance

Edit the link collection in [resources.json](../src/data/resources.json). The typed loader in [community-resources.ts](../src/data/community-resources.ts) validates it and passes only published entries to the homepage and directory.

Each entry needs an ID, title, category, summary, original source URL, source label, sourceCheckedOn date (YYYY-MM-DD), and status (draft or published). Allowed categories are Community, Maintenance, Destinations, Beginner, and Transport. Source labels distinguish community notices from member discussions; neither is an endorsement.

Drafts are excluded from the rendered list and from props sent to the browser. They are not private: source files live in a Git repository, and drafts must not contain confidential details. Draft records must still satisfy the schema. Duplicate IDs or multiple URLs pointing to the same Reddit post fail validation.

Run `npm run validate:content` before publishing. It validates resources and rides locally, reports field paths for malformed entries, and exits unsuccessfully on an error. The Next.js build also validates the collections when importing them.

The public source-check date records an editorial check, not a live availability guarantee or moderator approval. Existing dates reflect the source inspection documented below, including the possibility of cached retrieval. Keep the original post as the source of truth.

The resource page supports case-insensitive, all-word search across titles, summaries, and categories, combined with a category filter. The homepage remains a short, unfiltered list. Search is local to the published collection; it does not query Reddit.

## Initial sources

Source pages inspected on 2026-11-16 through web retrieval. Retrieved pages may be cached; this is not a guarantee of live availability or moderator approval.

- Community standards: https://www.reddit.com/r/bangalorebikes/comments/1waqjsy/a_quick_reminder_on_community_standards_respect/
- Member inbox notice: https://www.reddit.com/r/bangalorebikes/comments/1we7dob/community_notice_respecting_member_inboxes_zero/
- Workshop experience: https://www.reddit.com/r/bangalorebikes/comments/1smqhi8/service_update_with_location/

These are links with original editorial summaries, not copies of posts or comments. Author attribution and the complete discussion remain at the linked source. No images, vote counts, contact numbers, or private group invitations are mirrored.

## Adding or updating a link

1. Open the original source and check that it belongs to r/BangaloreBikes and is still available.
2. Add a valid draft record with a stable ID, short descriptive title, category, original summary, source URL, source label, and source-check date.
3. Distinguish community notices from member experiences. Do not turn a testimonial into a verified business recommendation.
4. Obtain explicit moderator approval before describing an item as moderator-approved or a ride as official.
5. Remove or update a link if the original is removed, becomes unavailable, or the moderators request a correction.
6. Set status to published only when the source and summary are ready. Run content validation, lint, and the production build before submitting the content change.

Run `npm run test:resources` to verify query and category behavior (Node 22.18+). These tests use Node's TypeScript stripping and built-in test runner; no test dependency is required. Node may emit a module-type detection warning because the application package does not declare an ESM module type.

There are no confirmed upcoming rides in the website's content collection. Historical invitations are not upcoming events. Add real event details only after the organizer confirms them for publication.
