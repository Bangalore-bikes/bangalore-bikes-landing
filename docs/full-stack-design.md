# Full-stack direction

The owner requested a richer community site, live or recent subreddit posts, a WhatsApp invite QR and database-backed CRUD within the existing Next.js application.

## What Next.js provides

App Router route handlers can implement GET, POST, PATCH and DELETE endpoints. Next.js does not include a database or an automatically persistent filesystem database.

Vercel Functions have a read-only application filesystem and temporary, instance-local `/tmp`. A SQLite file there is neither shared across function instances nor retained when they stop. A local file is therefore not a production CRUD store for the current deployment. See https://vercel.com/docs/functions/runtimes#file-system-support.

## Hosting decision

| Direction | Persistent storage | Owner responsibility |
| --- | --- | --- |
| Keep current serverless hosts | Managed SQL database, such as hosted SQLite/libSQL or Postgres | Provision the database, configure server-only credentials and backups/retention |
| One persistent application server | SQLite file on an attached persistent disk | Maintain server updates, disk backups, recovery and single-writer deployment topology |

The owner selected keeping Vercel/Netlify with managed storage. Target a hosted libSQL/SQLite database, with GitHub OAuth moderator sign-in. Production and staging must use separate databases and separate OAuth callback configurations. Credentials are configured through hosting environment variables, never pasted into chat or committed.

## Proposed first CRUD scope

Start with moderator-managed articles, confirmed rides and curated resources, retaining the existing Zod content schemas and source attribution. Public readers only see published content; editors can create drafts, edit, publish and remove records. Actual organiser approval remains required for real ride publication.

An editor UI requires real authentication and authorisation, not just hidden navigation. The proposed initial identity provider is GitHub OAuth with an explicitly configured moderator allowlist, server-only secrets and checks on every mutation. The owner still needs to select the administrator identities and provide the identity-provider configuration. Protect mutations from cross-origin requests, validate request bodies, keep an audit trail, and use conflict detection so simultaneous edits do not silently overwrite one another.

No public write endpoint will be enabled before durable storage and moderator authentication are configured. Read-only community feed routes and client-side destination export do not require the CRUD database.

## Independent features

- QR asset encodes the exact WhatsApp invite supplied by the owner. The encoder and scan test run locally/CI; QR generation does not contact a third-party QR service.
- Reddit posts use a bounded, cached server-side feed request. If Reddit blocks it, show labelled curated highlights, not invented trending ranks, votes or live timestamps. Keep fallback tests independent of external availability.
- Destination sharing and CSV export retain the original historical-source context.
