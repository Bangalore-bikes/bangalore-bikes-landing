# Native community wiki migration

## Intended experience

The owner requested the existing r/BangaloreBikes wiki content on the website itself, not a directory of outbound Reddit links. Preserve the incumbent Space Grotesk typography, charcoal/yellow identity, light/dark tokens and mobile navigation. Extend the existing wiki and destinations surfaces rather than rebrand the site.

The wiki becomes a readable handbook with native topic pages, section navigation and source attribution. Destinations become a searchable, filterable directory with expandable source records. Home promotes the handbook and destinations before outbound discussions. `bangalorebikes.com` stays canonical and Vercel stays secondary/staging.

## Source coverage and limits

- Public wiki index: https://www.reddit.com/r/bangalorebikes/wiki/index/
- Routes and destinations: https://www.reddit.com/r/bangalorebikes/wiki/index/routes_and_destinations/
- Original public worksheet: https://docs.google.com/spreadsheets/d/1dJyNKE22LkDEHM-WbbByP4EyoMx03UsvztuGk-cg95k/edit
- The worksheet explicitly says it has not been updated since 2010. Preserve all original fields as historical source data, not current ratings, access, road-condition, accommodation or safety assurances.
- Wiki rules, ride rules, WhatsApp rules, events and emergency-contact subpages are currently blocked by Reddit. The owner has been asked for their Markdown source. Do not claim a complete verbatim wiki mirror before those sources arrive.
- Readable moderator announcements may support clearly attributed summaries in the meantime. Do not label those summaries as exact copies of the blocked wiki pages.
- Emergency number 112 is supported by the Ministry of Home Affairs ERSS source. No unverified towing numbers or community hotline will be invented.

## Verification

Validate imported row structure and uniqueness. Preserve duplicate source numbers without losing entries. Test search, category/distance intersections, unknown-distance behavior and source-column preservation. Verify native guide links, readable content, mobile overflow, filter/reset interactions, unknown guide 404s and generated canonicals/sitemap entries in the existing automated workflow. After merge, check actual staging HTML and deployment status before claiming the new experience is live.

## Implemented coverage

- Six native, source-attributed guides: community standards, first group ride, WhatsApp/privacy, emergency contacts, destinations and the community introduction.
- These are readable adaptations of accessible sources, **not** exact mirrors of blocked wiki subpages. Event entries and the exact blocked wiki text remain pending the owner's export.
- All 108 original worksheet records, plus historical Hampi row 76 retained in the wiki, give 109 records. Both Hampi rows and both source-No.-92 rows remain present. All 17 source columns are available in expandable records.
- Home, the wiki, navigation and roadside-help page now lead to native content. Outbound links remain available for original sources, maps, WhatsApp opt-in and actual community discussion.
- Main was verified at commit `4a4e4a2a2b10f13ce977eb2fa2bf23a26b744996` with a successful Vercel deployment before this migration. Staging's old sparse appearance was content-related, not evidence of an unpublished local feature branch.
