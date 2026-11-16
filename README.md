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

Edit [resources.json](./src/data/resources.json) for attributed Reddit resources, [rides.json](./src/data/rides.json) for organizer-confirmed rides, and [articles.json](./src/data/articles.json) for original or permissioned articles. No component edits or API credentials are required.

Resource drafts are omitted from the website; they are not private repository storage. Ride listings must be confirmed before publication. See [content maintenance](./docs/content-maintenance.md) and [ride publishing](./docs/rides.md).

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

Project is currently hosted at [bangalorebikes.com](https://bangalorebikes.com/) as a [Netlify](https://www.netlify.com/) project.

[bangalorebikes.vercel.app](https://bangalorebikes.vercel.app/) is also available as the secondary/staging deployment. The primary domain remains the canonical address for search engines and sharing.
