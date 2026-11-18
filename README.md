# [Bangalore bikes](https://bangalorebikes.com/) landing website

This repository serves as the development house for [r/BangaloreBikes](https://www.reddit.com/r/bangalorebikes/) official website. People can access preferable Ride locations conveniently, Emergency contacts page in the city, Dos and don’ts of communication, Ride safety information, Shipping related useful information, and other tips and helpful features related to biking.

## Getting Started

This is a Next.js v15 application. We are using app router.

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deciding what to work on

Check out the [issues](https://github.com/Bangalore-bikes/bangalore-bikes-landing/issues) tab, pick an issue that hasn't been assigned to anyone and you can start contributing

## Editing community content

The [native handbook](https://bangalorebikes.com/wiki) and destination directory now include on-site reading, full-text guide search, and 109 historical destination records. See [wiki migration](./docs/wiki-migration.md) for source coverage and the blocked pages still awaiting an export. The original worksheet has not been updated since 2010; it is not a current route or service guide.

Edit `src/data/wiki-guides.json` for source-attributed handbook pages. `scripts/import-wiki-destinations.mjs` is a manual public-source import, not a build-time network dependency. The content validator checks both collections.

Edit [resources.json](./src/data/resources.json) for attributed Reddit resources, [rides.json](./src/data/rides.json) for organizer-confirmed rides, and [articles.json](./src/data/articles.json) for original or permissioned articles. No component edits or API credentials are required.

Resource drafts are omitted from the website; they are not private repository storage. Ride listings must be confirmed before publication. See [content maintenance](./docs/content-maintenance.md) and [ride publishing](./docs/rides.md).

Moderators can also manage the same collections in the browser at `/admin` once the managed database and GitHub sign-in are configured. See [managed content admin](./docs/content-admin.md) and the [activation guide](./docs/activation-guide.md). Repository JSON stays the fallback when no database is configured.

Riders can publish their own posts. Any account can write in Markdown, first posts are reviewed, and trusted authors publish immediately. See [community publishing](./docs/community-blogging.md) for the trust rules, the directive reference and the environment variables that switch it on.

See [article publishing](./docs/articles.md) for structured content, attribution, and publication requirements.

With Node 22.18+:

```bash
npm run validate:content
npm run test:content
npm run test:rides
npm run test:resources
npm run typecheck
npm run lint
npm run build
npm run test:seo
```

SEO checks inspect the production build output, so run them after building.

Pull requests and pushes to `main` run these checks, both builds, and real Chrome smoke checks automatically. See [automated checks](./docs/automated-checks.md) for the workflow and troubleshooting context.

Run npm test for the combined content, resource-search, and ride unit tests. The [local Storybook guide](./docs/storybook.md) explains component previews and the compatibility launcher.

For local browser smoke checks, build the app, run npm start -- -p 3102 in another terminal, then run npm run test:browser. See the Storybook guide for browser prerequisites and test coverage.

## Hosting

See [community features](./docs/community-features.md) for invite QR generation, community-feed availability, shareable destinations and CSV exports. The [full-stack direction](./docs/full-stack-design.md) records the selected managed-database architecture and remaining configuration.

Project is currently hosted at [bangalorebikes.com](https://bangalorebikes.com/) as a [Netlify](https://www.netlify.com/) project.

[bangalorebikes.vercel.app](https://bangalorebikes.vercel.app/) is also available as the secondary/staging deployment. The primary domain remains the canonical address for search engines and sharing.
