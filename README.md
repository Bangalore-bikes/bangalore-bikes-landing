# [Bangalore Bikes](https://bangalorebikes.com/)

The website for the [r/BangaloreBikes](https://www.reddit.com/r/bangalorebikes/) community in Bengaluru: where to ride, how to keep a bike running, ride safety, the community handbook, and a place for riders to publish and discuss.

## What is on the site

| Area | Path | Notes |
| --- | --- | --- |
| Home | `/` | Hero, quick links, ride picker (distance, month, type), community highlights |
| Destinations | `/destinations`, `/destinations/[slug]` | 109 records from the community's 2010 worksheet, each with its own page |
| Handbook | `/wiki`, `/wiki/[slug]` | Source-attributed guides with full-text search |
| Rides | `/rides` | Organizer-confirmed rides with calendar export |
| Maintenance | `/maintenance` | Garages and care notes |
| Rider posts | `/posts`, `/posts/[slug]` | Member-written posts, moderated, with comments |
| Accounts | `/signup`, `/login`, `/write`, `/drafts`, `/account/security` | Email and password, optional authenticator app |
| Moderation | `/moderation`, `/admin` | Post review and managed content admin |
| Machine-readable | `/llms.txt`, `/md/*`, `/sitemap.xml`, `/rss.xml` | Markdown mirrors are `noindex` and canonical to the HTML page |

The destination figures are 2010 source values, not current route advice. Pages say so.

## Run it locally

Node 22.18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Without database variables the site still runs. Accounts, rider posts and comments need the database; static content does not.

## Checks

```bash
npm run typecheck
npm run lint
npm test                 # unit tests, including comments, auth and SEO
npm run validate:content
npm run build
npm run test:seo         # inspects the build output, so build first
```

Pull requests and pushes to `main` run these, both builds, and Chrome smoke checks. See [automated checks](./docs/automated-checks.md).

## Where content lives

- Handbook guides: `src/data/wiki-guides.json`. Destinations: `src/data/wiki-destinations.json`, imported by `scripts/import-wiki-destinations.mjs` (a manual step, never a build dependency).
- Resources, rides and articles: `src/data/resources.json`, `rides.json`, `articles.json`. No component edits needed. See [content maintenance](./docs/content-maintenance.md) and [ride publishing](./docs/rides.md).
- Rider posts, accounts and comments: the database, managed through the site. See [community publishing](./docs/community-blogging.md).

## Accounts, posts and comments

Anyone can sign up, confirm their email and write in Markdown. First posts are reviewed; trusted authors publish immediately. Signed-in riders can comment on published posts (plain text, 1000 characters, 10 per hour). Authors can delete their own comments and moderators can delete any. Details and the trust rules are in [community publishing](./docs/community-blogging.md).

## Motion and design

The theme is dark with an amber accent. Motion is deliberately small: a staggered hero entrance, count-up stats, scroll reveals and card lift. All of it is disabled for readers who prefer reduced motion, and content is visible without JavaScript. Components live in `src/components/motion`.

## Configuration

Production needs these server-side variables (never `NEXT_PUBLIC_` for secrets): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_ENCRYPTION_KEY`, `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY`, `MAIL_FROM`, `ADMIN_EMAILS` and `NEXT_PUBLIC_SITE_URL`. `MAIL_FROM` must be a verified Brevo sender on a domain you own; Gmail addresses are dropped by receiving servers. The step-by-step setup, database migration and verification checklist is the [activation guide](./docs/activation-guide.md).

## Hosting

[bangalorebikes.vercel.app](https://bangalorebikes.vercel.app/) is the live deployment. A Netlify project also builds previews. See [full-stack design](./docs/full-stack-design.md) and [community features](./docs/community-features.md).

## Contributing

Check the [issues](https://github.com/Bangalore-bikes/bangalore-bikes-landing/issues) for something unassigned. `main` is protected: open a pull request and wait for checks.
