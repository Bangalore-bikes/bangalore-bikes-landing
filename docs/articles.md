# Community article publishing

Edit [articles.json](../src/data/articles.json). The archive is intentionally empty until original or permissioned articles are supplied. It does not copy Reddit posts into website articles.

Each record needs a unique lowercase hyphenated slug, title, summary, author display name, status (draft/published), permissionConfirmed boolean, updatedAt ISO timestamp, blocks, and sources.

Publishing additionally requires permissionConfirmed to be true and a publishedAt timestamp. This is the editor's record of permission, not an identity check or a consent-capture system. Obtain the author's actual permission before asserting it.

Drafts never get public detail routes or sitemap entries and are filtered on the server. They are still source files in a repository, not private storage.

Content blocks are:

- paragraph: type and text.
- heading: type and text, rendered as a level-two heading.
- list: type and a nonempty array of text items.

Sources are a list of label/HTTPS URL objects. Use an empty list for original content with no external references. Raw HTML, MDX, scripts, embeds, arbitrary attributes, and unsupported block types are rejected. Text is rendered through React as text, not interpreted as markup.

Dates must parse as real ISO timestamps with explicit offsets. updatedAt cannot precede publishedAt. Dates describe publication; this workflow is not a scheduler. Set published only when the article is actually ready to publish.

Published articles appear newest-first at /blogs and the latest three appear on the homepage. Their details live at /blogs/<slug>, with author attribution, publication/update dates in IST, source links, canonical/social metadata, and sitemap entries. Unknown or draft slugs return 404.

The blog index becomes indexable automatically when at least one article is published. Preview deployments remain noindex. The ride index now follows the same automatic populated/empty rule.

## Validation and checks

Run npm run validate:content, npm test, lint, and the production build. Run npm run test:seo after building. The content validator checks articles, resources, and rides; malformed records fail the build.

Storybook contains an isolated sample article for checking structured rendering without publishing fake content. The extended browser smoke command checks that literal angle-bracket text stays text.

This implements the repository-backed publishing option. A Notion connector, non-Git editor UI, and automated Reddit ingestion remain separate integrations requiring a content owner and the appropriate service access. The old Notion draft was not merged into this feature.
