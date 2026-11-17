# Community features

## WhatsApp invitation

The owner supplied both supported invite URLs. They live in `src/lib/community.ts`. The direct invitation is shown as a locally generated QR on `/join` and the homepage, with PNG/SVG downloads; a second PNG/SVG encodes the supplied short link.

Run `npm run generate:qr` after changing an invite. Both published PNGs are decoded by the test suite and compared with their exact target URLs. No external QR service is used. Joining is optional and the interface explains phone-number visibility. No claim is made that the group is always open.

## Community posts

`/api/community-posts?sort=hot` and `?sort=new` request the subreddit Atom feed server-side. Requests have a five-second timeout; successful responses and failures are cached for five minutes. This avoids a new upstream retry for every visitor. Unsupported sort values return 400.

The parser rejects DTD/entity declarations, malformed/oversized XML, invalid dates, cross-community/unsafe links, duplicate posts and explicitly NSFW-labelled titles. It does not render upstream HTML or invent vote counts. Feed thumbnails are not imported from unreviewed HTML. The curated workshop preview links to the actual image attached to its attributed source and disappears gracefully if unavailable.

If Reddit blocks access, the interface says it is showing selected community highlights—not live Trending or Newest results. The source returned 403/429 during implementation. Reliable live results may require approved Reddit API access; the site does not bypass those restrictions. Browser tests simulate live and unavailable responses independently of Reddit's network availability.

## Destination sharing and export

Filters are reflected in `q`, `type` and `distance` URL parameters. Reloading or sharing the address restores the view. Individual records have `#place-<id>` links and open automatically; a record link is revealed even if incompatible query filters were attached.

The download exports only the currently visible records. It retains all 17 source columns, a historical-source notice and canonical record links. CSV quoting, CRLF line endings, Unicode and spreadsheet-formula escaping are tested. The original records remain unchanged. The source age is still 2010; export does not make it current travel advice.

## Workshop content

`/maintenance/garages` summarises the existing source-linked member report about PFB Customs, attributes the author and links the author's map. It is not a fabricated rating, independently verified listing or availability promise.
