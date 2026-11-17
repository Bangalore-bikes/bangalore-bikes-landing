# Managed content storage repository

`src/lib/content-store.ts` is a dependency-free SQLite/libSQL repository for
`articles`, `rides`, and `resources`. It has no Next.js, Node, Zod, environment,
network, or runtime source imports. The application owns the injected client,
its lifecycle, authentication, authorization, schema validation, and public wiring.
No production database is provisioned or configured by this module.

## Client contract

The exported `SqlClient` structurally accepts a web libSQL client with
`execute({ sql, args })` and `batch(statements, "write")`. Results expose `rows`
as named-column objects. Bind values use portable SQL scalar/binary types.
Every batch **must** execute on one connection in one atomic write transaction,
in statement order, and roll back on any failure. Do not implement batch as
independent remote execute calls. SQLite JSON functions and `RETURNING` are required.
Tests supply a small adapter using real `node:sqlite` and `BEGIN IMMEDIATE`.

## API

```ts
type Collection = "articles" | "rides" | "resources";
type WriteOptions = { published?: boolean };
type SeedRecord<T = unknown> = { id: string; data: T; published?: boolean };
type StoredRecord<T = unknown> = {
  collection: Collection; id: string; data: T;
  version: number; deleted: boolean; published: boolean;
};

const store = createContentStore(client);
await store.migrate();
await store.seedOnce(seeds, actor);
await store.list<T>(collection, "published"); // default
await store.list<T>(collection, "all");
await store.get<T>(collection, id);
await store.create<T>(collection, id, data, actor, { published });
await store.update<T>(collection, id, data, expectedVersion, actor, { published });
await store.delete(collection, id, expectedVersion, actor);
await store.audit(collection, id); // both filters optional
```

- `migrate()` and `seedOnce()` return `Promise<void>`.
- `seedOnce` takes `Partial<Record<Collection, SeedRecord[]>>` and a nonempty actor.
- `list<T = unknown>` returns `Promise<StoredRecord<T>[]>`, ordered by ID.
- `get<T = unknown>` returns `Promise<StoredRecord<T> | null>`.
- `create<T>` and `update<T>` return `Promise<StoredRecord<T>>` from the mutation's
  own `RETURNING` result, not a later read that could observe another writer.
- `delete` returns `Promise<void>`.
- `audit` returns `Promise<AuditEntry[]>`, ordered by ascending audit ID.
  Entries contain `id`, `collection`, `recordId`, `actor`, `action`, `version`,
  and database-generated UTC `createdAt`. Actions are create/update/delete/seed.
- `ContentStore`, `SqlClient`, `SqlStatement`, `SqlResult`, `SqlValue`,
  `Collection`, `WriteOptions`, `SeedRecord`, `StoredRecord`, and `AuditEntry`
  are exported types; use `import type` for types.

The record ID is a separate immutable storage key. Pass article/ride `slug` or
resource `id` explicitly. The repository does not add fields to domain JSON.
Callers must validate IDs against their domain schema and reject mismatches
between the route key and the submitted JSON identity.

## Visibility and validation

Every row stores publication metadata separately from domain JSON. On **each**
create/update/seed, `published` overrides derived visibility. If omitted,
articles/resources derive it from `data.status === "published"`; rides default
to false. Updates replace the whole JSON and recompute visibility: callers must
resupply ride publication metadata on every update to retain publication.
`scheduled`/`cancelled` is not treated as a publication state. The caller validates
all rides with the existing schema, including `confirmed: true`.

`list("…", "published")` excludes drafts/unpublished rows. `list("…", "all")`
includes all live records, not tombstones. `get` returns a live record regardless
of publication state, so public handlers must check `record.published` themselves.
Audit reads and all-record reads require application authorization; the repository
performs no authentication. Never derive audit actor from untrusted request JSON.

## Concurrency, deletion, audit, and uniqueness

Versions start at 1. Updates and deletes require the current positive version;
one conditional SQL mutation increments it. Missing, stale, and deleted targets
all raise `ContentStoreError` with `code: "CONFLICT"`. Existing IDs, including
tombstones, cannot be created again. Deletes keep JSON and incremented version,
set deleted, and clear publication; there is no restore or hard-delete API.

Each successful write and its audit insert are one atomic batch. Failed writes
leave no audit entry; failed audit inserts roll back the content change. Actor
and action are bound values. The conditional audit insert uses SQLite's
connection-local `changes()` from the immediately preceding content mutation.

Resource source keys are lowercase original r/BangaloreBikes Reddit post IDs,
ignoring URL host alias, title, query, fragment, and post-ID case. A partial
unique index applies to all live resources, including drafts. A conflicting
create/update/seed raises `SOURCE_CONFLICT` and rolls back the transaction.
Deleting a resource releases its source key, but not its storage ID.

Invalid collection, ID, actor, version, visibility, publication override, JSON
object, or resource source envelope raises `INVALID_INPUT`. Other database errors
propagate unchanged. Domain content validation remains the application's job.
All table/index identifiers are fixed; request values use SQL parameters.

## Migration and seed-once

Call `migrate()` before use; it transactionally creates the v1 fixed tables and
index and records `schema-v1` in `content_migrations`. Repeated calls are safe.
This initializes v1, not an automatic upgrade of unrelated or legacy schemas.

`seedOnce` atomically imports each supplied collection's initial snapshot and
records `seed-v1:<collection>`. It inserts only IDs never stored before, so both
edited live records and tombstones are preserved. Seed imports use normal
resource uniqueness and audit rules. Any failure rolls back the entire supplied
batch, including markers, allowing a corrected retry. An explicitly supplied
empty array marks that collection seeded; an omitted collection remains eligible.
After a marker exists, new snapshot entries are not imported. Subsequent calls
still validate supplied inputs; pass the same valid snapshot or avoid calling
again if content has intentionally become invalid under application validation.

## Verification

```sh
node --experimental-strip-types --test tests/content-store.test.mjs
```

Tests run entirely in Node 22.19 using isolated in-memory SQLite databases with
automatic cleanup. They require no credentials, network, Python, or extra
packages. Node 22 emits expected experimental SQLite and module-type warnings;
package metadata is deliberately unchanged. Managed service connectivity,
credentials, backups, and deployment remain separate integration work.
