# Automated quality checks

The **Community hub checks** GitHub Actions workflow runs on every pull request and every push to `main`. Maintainers can also run it manually from the Actions tab once the workflow is on the default branch.

It installs the committed `bun.lock` with `--frozen-lockfile`, using Bun 1.3.9 and Node 22.19.0. A missing or stale lockfile fails rather than silently changing deployed dependencies. Setup actions are pinned to immutable commits.

The job runs, in order:

1. Validation of resource, ride and article data.
2. Content, resource-search and calendar unit tests.
3. ESLint and TypeScript checks.
4. The production Next.js build.
5. SEO tests against the generated build output.
6. The static Storybook build.
7. Headless Chrome smoke checks against the local production server and isolated Storybook fixtures.

The runner starts its own application on port 3102, waits for readiness, and stops it when checks finish. Browser checks use a fresh temporary profile; they do not connect to Reddit accounts, send modmail, or publish rides. Fixtures do not enter the published content collections.

The workflow has read-only repository permissions and needs no deployment secrets or service credentials. Superseded runs on the same branch are cancelled. It does not deploy or change branch-protection rules. Administrators can make **Content, build and browser checks** a required check if desired; merging without review does not mean ignoring a failing check.

## Hosting

`https://bangalorebikes.com` remains the canonical production origin. `https://bangalorebikes.vercel.app` remains available as a secondary/staging deployment. The quality workflow does not change either provider's domain, DNS, deployment branch or environment settings.

Netlify and Vercel deployments have their own provider checks. A successful quality run verifies the repository, not public DNS availability or the providers' custom-domain configuration.
