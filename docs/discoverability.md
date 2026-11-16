# Search and social previews

The production origin is https://bangalorebikes.com, as recorded in the project README. Change the origin in [siteMetadata.ts](../src/lib/siteMetadata.ts) if the production domain changes.

All public routes have individual titles, descriptions, canonical URLs, and social previews using the existing hero image. Metadata describes what the page actually offers; it does not claim unpublished articles, confirmed rides, or verified services.

The homepage, resource directory, and contact page are indexable and appear in the sitemap. Unpopulated sections remain accessible with noindex metadata and are excluded from the sitemap. When substantive content is published, update that route's index flag in the shared metadata registry.

Netlify deploy-preview and branch-deploy contexts receive noindex metadata, crawler exclusion, and an empty sitemap. Canonicals always refer to the production origin.

The not-found page offers a homepage link and retains Next.js's noindex behavior.

## Verification

Run lint and the production build, followed by `npm run test:seo`. Output tests inspect generated HTML, sitemap, and robots files. Policy tests check production and both Netlify preview contexts. Node 22.18+ is needed for the policy tests' TypeScript stripping.

These checks verify output, not search-engine ranking or indexing guarantees. No crawler submission, analytics service, or external publishing integration is configured.
