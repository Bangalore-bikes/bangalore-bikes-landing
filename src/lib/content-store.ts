/** Dependency-free SQLite/libSQL repository. Domain validation belongs to callers. */
export type Collection = "articles" | "rides" | "resources";
export type SqlValue = string | number | bigint | null | Uint8Array;
export type SqlStatement = { sql: string; args?: SqlValue[] };
export type SqlResult = {
  rows: Array<{ [column: string]: unknown }>;
  rowsAffected?: number;
};
/** batch MUST be an atomic transaction, including rollback on any statement failure. */
export interface SqlClient {
  execute(statement: SqlStatement): Promise<SqlResult>;
  batch(statements: SqlStatement[], mode: "write"): Promise<SqlResult[]>;
}
export type WriteOptions = { published?: boolean };
export type SeedRecord<T = unknown> = { id: string; data: T; published?: boolean };
export type StoredRecord<T = unknown> = {
  collection: Collection;
  id: string;
  data: T;
  version: number;
  deleted: boolean;
  published: boolean;
};
export type AuditEntry = {
  id: number;
  collection: Collection;
  recordId: string;
  actor: string;
  action: "create" | "update" | "delete" | "seed";
  version: number;
  createdAt: string;
};
export class ContentStoreError extends Error {
  readonly code: "INVALID_INPUT" | "CONFLICT" | "SOURCE_CONFLICT";
  constructor(code: ContentStoreError["code"], message: string) {
    super(message);
    this.name = "ContentStoreError";
    this.code = code;
  }
}

const collections: Collection[] = ["articles", "rides", "resources"];
const statement = (sql: string, args: SqlValue[] = []): SqlStatement => ({ sql, args });
function invalid(message: string): never {
  throw new ContentStoreError("INVALID_INPUT", message);
}
function collectionCheck(collection: Collection) {
  if (!collections.includes(collection)) invalid("Unknown content collection");
}
function nonempty(value: string, name: string) {
  if (typeof value !== "string" || !value.trim()) invalid(`${name} must not be empty`);
}
function versionCheck(version: number) {
  if (!Number.isSafeInteger(version) || version < 1 || version >= Number.MAX_SAFE_INTEGER) {
    invalid("Expected version must be a positive safe integer below MAX_SAFE_INTEGER");
  }
}
function payload(collection: Collection, data: unknown, options: WriteOptions) {
  if (!data || typeof data !== "object" || Array.isArray(data)) invalid("Content must be a JSON object");
  const value = data as { status?: string; url?: string };
  if (options.published !== undefined && typeof options.published !== "boolean") invalid("published must be boolean");
  let json: string;
  try { json = JSON.stringify(data); } catch { return invalid("Content must be JSON serializable"); }
  if (!json || !json.startsWith("{")) invalid("Content must serialize as a JSON object");
  let source: string | null = null;
  if (collection === "resources") {
    try {
      const url = new URL(value.url ?? "");
      const match = /^\/r\/bangalorebikes\/comments\/([a-z0-9]+)(?:\/|$)/i.exec(url.pathname);
      if (url.protocol !== "https:" || !["reddit.com", "www.reddit.com"].includes(url.hostname) || url.username || url.password || url.port || !match) {
        invalid("Resource requires an original r/BangaloreBikes post URL");
      }
      source = match[1].toLowerCase();
    } catch (error) {
      if (error instanceof ContentStoreError) throw error;
      invalid("Resource requires an original r/BangaloreBikes post URL");
    }
  }
  return { json, source, published: Number(options.published ?? (collection !== "rides" && value.status === "published")) };
}
function record<T>(row: SqlResult["rows"][number]): StoredRecord<T> {
  return {
    collection: row.collection as Collection, id: String(row.id),
    data: JSON.parse(String(row.json)) as T, version: Number(row.version),
    deleted: Boolean(Number(row.deleted)), published: Boolean(Number(row.published)),
  };
}
function translate(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (/UNIQUE constraint failed: content_records.source_key/i.test(message)) {
    throw new ContentStoreError("SOURCE_CONFLICT", "Resource source already exists");
  }
  throw error;
}
function auditStatement(collection: Collection, id: string, actor: string, action: AuditEntry["action"]) {
  return statement(`INSERT INTO content_audit (collection, record_id, actor, action, version)
    SELECT collection, id, ?, ?, version FROM content_records
    WHERE collection = ? AND id = ? AND changes() > 0`, [actor, action, collection, id]);
}

export function createContentStore(client: SqlClient) {
  async function write(statements: SqlStatement[]) {
    try { return await client.batch(statements, "write"); }
    catch (error) { return translate(error); }
  }
  return {
    async migrate(): Promise<void> {
      await write([
        statement(`CREATE TABLE IF NOT EXISTS content_records (
          collection TEXT NOT NULL CHECK (collection IN ('articles','rides','resources')),
          id TEXT NOT NULL, json TEXT NOT NULL CHECK (json_valid(json)),
          version INTEGER NOT NULL CHECK (version >= 1),
          deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0,1)),
          published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
          source_key TEXT, PRIMARY KEY (collection, id))`),
        statement(`CREATE UNIQUE INDEX IF NOT EXISTS content_resource_source
          ON content_records(source_key) WHERE collection = 'resources' AND deleted = 0`),
        statement(`CREATE TABLE IF NOT EXISTS content_audit (
          id INTEGER PRIMARY KEY AUTOINCREMENT, collection TEXT NOT NULL,
          record_id TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL,
          version INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`),
        statement(`CREATE TABLE IF NOT EXISTS content_migrations (name TEXT PRIMARY KEY)`),
        statement(`INSERT OR IGNORE INTO content_migrations(name) VALUES ('schema-v1')`),
      ]);
    },
    async seedOnce(seeds: Partial<Record<Collection, SeedRecord[]>>, actor: string): Promise<void> {
      nonempty(actor, "Actor");
      const statements: SqlStatement[] = [];
      for (const [key, entries] of Object.entries(seeds)) {
        const collection = key as Collection;
        collectionCheck(collection);
        if (!Array.isArray(entries)) invalid("Seeds must be arrays");
        const marker = `seed-v1:${collection}`;
        for (const entry of entries) {
          nonempty(entry.id, "ID");
          const value = payload(collection, entry.data, { published: entry.published });
          statements.push(statement(`INSERT INTO content_records
            (collection,id,json,version,deleted,published,source_key)
            SELECT ?,?,?,1,0,?,? WHERE NOT EXISTS (SELECT 1 FROM content_migrations WHERE name = ?)
            AND NOT EXISTS (SELECT 1 FROM content_records WHERE collection = ? AND id = ?)
            RETURNING *`, [collection, entry.id, value.json, value.published, value.source, marker, collection, entry.id]));
          statements.push(auditStatement(collection, entry.id, actor, "seed"));
        }
        statements.push(statement(`INSERT OR IGNORE INTO content_migrations(name) VALUES (?)`, [marker]));
      }
      if (statements.length) await write(statements);
    },
    async list<T = unknown>(collection: Collection, visibility: "published" | "all" = "published"): Promise<StoredRecord<T>[]> {
      collectionCheck(collection);
      if (visibility !== "published" && visibility !== "all") invalid("Unknown visibility");
      const result = await client.execute(statement(`SELECT * FROM content_records
        WHERE collection = ? AND deleted = 0 AND (? = 'all' OR published = 1) ORDER BY id`, [collection, visibility]));
      return result.rows.map(row => record<T>(row));
    },
    async get<T = unknown>(collection: Collection, id: string): Promise<StoredRecord<T> | null> {
      collectionCheck(collection); nonempty(id, "ID");
      const result = await client.execute(statement(`SELECT * FROM content_records WHERE collection = ? AND id = ? AND deleted = 0`, [collection, id]));
      return result.rows[0] ? record<T>(result.rows[0]) : null;
    },
    async create<T>(collection: Collection, id: string, data: T, actor: string, options: WriteOptions = {}): Promise<StoredRecord<T>> {
      collectionCheck(collection); nonempty(id, "ID"); nonempty(actor, "Actor");
      const value = payload(collection, data, options);
      const results = await write([
        statement(`INSERT INTO content_records (collection,id,json,version,deleted,published,source_key)
          VALUES (?,?,?,1,0,?,?) ON CONFLICT(collection,id) DO NOTHING RETURNING *`, [collection, id, value.json, value.published, value.source]),
        auditStatement(collection, id, actor, "create"),
      ]);
      if (!results[0].rows[0]) throw new ContentStoreError("CONFLICT", "Record ID already exists, including deleted records");
      return record<T>(results[0].rows[0]);
    },
    async update<T>(collection: Collection, id: string, data: T, expectedVersion: number, actor: string, options: WriteOptions = {}): Promise<StoredRecord<T>> {
      collectionCheck(collection); nonempty(id, "ID"); nonempty(actor, "Actor"); versionCheck(expectedVersion);
      const value = payload(collection, data, options);
      const results = await write([
        statement(`UPDATE content_records SET json = ?, published = ?, source_key = ?, version = version + 1
          WHERE collection = ? AND id = ? AND version = ? AND deleted = 0 RETURNING *`, [value.json, value.published, value.source, collection, id, expectedVersion]),
        auditStatement(collection, id, actor, "update"),
      ]);
      if (!results[0].rows[0]) throw new ContentStoreError("CONFLICT", "Record missing, deleted, or version changed");
      return record<T>(results[0].rows[0]);
    },
    async delete(collection: Collection, id: string, expectedVersion: number, actor: string): Promise<void> {
      collectionCheck(collection); nonempty(id, "ID"); nonempty(actor, "Actor"); versionCheck(expectedVersion);
      const results = await write([
        statement(`UPDATE content_records SET deleted = 1, published = 0, version = version + 1
          WHERE collection = ? AND id = ? AND version = ? AND deleted = 0 RETURNING *`, [collection, id, expectedVersion]),
        auditStatement(collection, id, actor, "delete"),
      ]);
      if (!results[0].rows[0]) throw new ContentStoreError("CONFLICT", "Record missing, deleted, or version changed");
    },
    async audit(collection?: Collection, id?: string): Promise<AuditEntry[]> {
      if (collection !== undefined) collectionCheck(collection);
      if (id !== undefined) nonempty(id, "ID");
      const result = await client.execute(statement(`SELECT * FROM content_audit
        WHERE (? IS NULL OR collection = ?) AND (? IS NULL OR record_id = ?) ORDER BY id`, [collection ?? null, collection ?? null, id ?? null, id ?? null]));
      return result.rows.map(row => ({
        id: Number(row.id), collection: row.collection as Collection, recordId: String(row.record_id),
        actor: String(row.actor), action: row.action as AuditEntry["action"], version: Number(row.version), createdAt: String(row.created_at),
      }));
    },
  };
}
export type ContentStore = ReturnType<typeof createContentStore>;
