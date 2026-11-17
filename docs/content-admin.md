# Managed content admin

The site can manage articles, rides, and resource links from `/admin` instead
of editing JSON by hand. Repository JSON remains the fallback and the seed
source: when no database is configured, public pages keep reading the validated
files in `src/data/`.

## How it works

- `src/lib/content-store.ts` is a dependency-free SQLite/libSQL repository with
  versioned records, tombstones, an audit log, and seed-once markers.
- `src/lib/content-source.ts` reads published records from the database when
  `TURSO_DATABASE_URL` is configured, and otherwise falls back to the
  repository JSON. A database error also falls back, so the public site stays
  available.
- `src/lib/content-config.ts` applies the same Zod schemas as the public
  loaders. A record cannot be saved unless it validates.
- `/admin` is GitHub-authenticated. `ADMIN_GITHUB_LOGINS` is the moderator
  allowlist; any other account is denied. The database catch-all
  `/api/admin/content/[...]` repeats the authorization check on every request.
- Writes are optimistic: every record carries a `version`. A stale editor gets
  a 409 conflict instead of overwriting a concurrent change.
- Successful writes revalidate the affected public paths and the sitemap.

## Data model

| Collection  | Key              | Public visibility                         |
| ----------- | ---------------- | ----------------------------------------- |
| `articles`  | `slug`           | `status: published`, unless hidden        |
| `rides`     | `slug`           | visible by default; can be hidden         |
| `resources` | `id`             | `status: published`, unless hidden        |

A draft can never be made public by the visibility toggle; publish it by
changing `status`. Deleted records leave a tombstone so a seed never
resurrects them.

## Setup

Follow [activation-guide.md](./activation-guide.md). The short version:

1. Create the intended libSQL/Turso database and token.
2. Set the server-only variables in the hosting project.
3. Run the migration against that exact database:

   ```bash
   npm run db:migrate
   ```

   The script loads `.env.local` and `.env`, refuses unrelated databases
   unless `--force` is given, creates the schema idempotently, and seeds the
   repository JSON once. Re-running is safe.
4. Redeploy and open `/admin`.

Local development can point `TURSO_DATABASE_URL` at a `file:` path; serverless
hosts must use a remote database because their local files do not persist.

## Editor workflow

1. Sign in at `/admin` with an allowlisted GitHub account.
2. Choose the collection, then edit a record or press **New**.
3. Edit the JSON record. Keep the `slug`/`id` equal to the record key; the
   identity cannot be changed through the API.
4. Save. Validation errors list the failing field paths.
5. Use **Visible on public pages** to hide a published record without deleting
   it. For articles and resources the record still needs `status: published`
   to be visible.
6. Delete with the version shown in the editor. A conflict means another
   moderator changed the record first: reload before retrying.

Every create, update, delete, and seed is written to `content_audit` with the
GitHub login as the actor.

## API

All routes require an authenticated allowlisted moderator.

| Method   | Path                                  | Body                                   |
| -------- | ------------------------------------- | -------------------------------------- |
| `GET`    | `/api/admin/content/:collection`      | —                                      |
| `POST`   | `/api/admin/content/:collection`      | `{ data, published? }`                 |
| `PUT`    | `/api/admin/content/:collection/:id`  | `{ data, version, published? }`        |
| `DELETE` | `/api/admin/content/:collection/:id`  | `{ version }`                          |

Collections are `articles`, `rides`, and `resources`. Responses use `{ record }`
or `{ message, issues? }`; conflicts return 409 and configuration problems 503.

## Verification

```bash
npm run test:admin   # storage, schema validation, allowlist
npm test
npm run typecheck
npm run lint
npm run build
```

The admin tests use an in-memory SQLite database through an injected adapter;
they do not need network access or a configured database.
