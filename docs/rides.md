# Publishing confirmed rides

Add organizer-confirmed public events to [rides.json](../src/data/rides.json). The typed loader in [rides.ts](../src/data/rides.ts) validates the collection, which is intentionally empty. Test events belong only in [rides.test.mjs](../tests/rides.test.mjs).

Each record requires a unique lowercase hyphenated slug, title, description, start/end ISO timestamps with an explicit timezone offset, public meeting point, destination, positive distance in km, organizer display name, experience/pace expectations, original r/BangaloreBikes discussion URL, update timestamp, and confirmed set to true. Optional directions must use HTTPS.

Status is scheduled or cancelled; cancelled records require a reason. Confirmation is an editorial responsibility, not authentication or proof that approval happened. Obtain organizer approval before publishing public meeting details. Zod rejects malformed records and duplicate slugs at build time.

The homepage and directory share this collection. State is upcoming, in progress, past, or cancelled. Cancellation takes precedence. Time-based states update after browser mount and every 30 seconds; displays explicitly use Asia/Kolkata. A populated list briefly shows a schedule-checking message until browser time is available, avoiding stale build-time labels.

Each record gets a detail page at /rides/<slug>. Unknown slugs return 404. Scheduled details appear in the sitemap; cancelled details are excluded and carry noindex.

Only upcoming, non-cancelled rides can download an ICS snapshot at /rides/<slug>/calendar. Server time controls availability. The endpoint sends no-store headers, 404 for unknown rides, and 410 for cancelled/ongoing/past rides. Text is escaped, timestamps are UTC, lines use CRLF, and UTF-8 lines are folded to 75 octets. Event UID stays stable per slug.

This is not a calendar subscription or booking system. Riders must check the original discussion for updates and participation details. No RSVP counts or test events are published.

The ride index becomes indexable automatically when the collection contains records and is excluded while empty. Preview deployments remain noindex.

Run npm run test:rides, lint, and the production build. Tests cover validation, unique slugs, timestamp boundaries, cancellation precedence, calendar escaping, and UTF-8 folding. Actual events still need organizer review before publication.
