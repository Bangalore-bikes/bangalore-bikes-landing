import type { SqlClient } from "../content-store.ts";

/**
 * Creates the identity and publishing tables. Safe to run repeatedly: every
 * statement is `IF NOT EXISTS`, and no existing table is altered or dropped.
 *
 * Kept separate from the content store so the merged admin feature and its
 * `content_records` CHECK constraint stay untouched.
 */
const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified_at TEXT,
    password_hash TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'rider' CHECK (role IN ('rider','moderator')),
    trust_level INTEGER NOT NULL DEFAULT 0 CHECK (trust_level BETWEEN 0 AND 2),
    approved_count INTEGER NOT NULL DEFAULT 0,
    rejected_count INTEGER NOT NULL DEFAULT 0,
    disabled_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS users_handle ON users(handle)`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,

  `CREATE TABLE IF NOT EXISTS user_mfa (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_encrypted TEXT,
    enabled_at TEXT,
    last_counter INTEGER NOT NULL DEFAULT -1,
    pending_secret TEXT,
    pending_expires_at TEXT,
    change_id TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    PRIMARY KEY (user_id, code_hash)
  )`,

  `CREATE TABLE IF NOT EXISTS email_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens(user_id, purpose)`,

  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body_md TEXT NOT NULL,
    body_html TEXT,
    cover_image_url TEXT,
    tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
    author_id TEXT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft','pending','published','rejected','unpublished')),
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
    moderation_note TEXT,
    search_text TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE INDEX IF NOT EXISTS posts_status ON posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS posts_author ON posts(author_id, updated_at)`,

  `CREATE TABLE IF NOT EXISTS post_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body_md TEXT NOT NULL,
    editor_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    UNIQUE (post_id, version)
  )`,

  `CREATE TABLE IF NOT EXISTS post_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id),
    parent_id TEXT REFERENCES post_comments(id) ON DELETE CASCADE,
    body_md TEXT NOT NULL,
    body_html TEXT,
    status TEXT NOT NULL DEFAULT 'published'
      CHECK (status IN ('pending','published','rejected')),
    created_at TEXT NOT NULL,
    deleted_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS post_comments_post ON post_comments(post_id, created_at)`,

  `CREATE TABLE IF NOT EXISTS post_reactions (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('like','useful')),
    created_at TEXT NOT NULL,
    PRIMARY KEY (post_id, user_id, kind)
  )`,

  `CREATE TABLE IF NOT EXISTS workshop_reviews (
    id TEXT PRIMARY KEY,
    workshop_slug TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT NOT NULL,
    visit_month TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending','published','rejected')),
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS workshop_reviews_slug
    ON workshop_reviews(workshop_slug, status)`,

  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (key, window_start)
  )`,

  `CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
    object_key TEXT NOT NULL UNIQUE,
    mime TEXT NOT NULL,
    bytes INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  )`,

  /**
   * Shared with the managed content store, which creates the same table. It is
   * repeated here so post writes never depend on `db:migrate` having run first.
   * There is no collection CHECK, which is why posts can record against it.
   */
  `CREATE TABLE IF NOT EXISTS content_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT, collection TEXT NOT NULL,
    record_id TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
];

/**
 * FTS5 is present on Turso and in current SQLite builds, but not guaranteed in
 * every embedding. Search degrades to `LIKE` when the virtual table is absent,
 * so a missing extension must not block the migration.
 */
const FTS_DDL = `CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  post_id UNINDEXED,
  title,
  summary,
  body_md,
  tags
)`;

export type MigrationReport = { fts: boolean };

export async function migratePosts(
  client: SqlClient,
): Promise<MigrationReport> {
  await client.batch(
    DDL.map((sql) => ({ sql })),
    "write",
  );
  await client.execute({
    sql: "CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(window_start)",
  });

  try {
    await client.execute({ sql: FTS_DDL });
    return { fts: true };
  } catch (error) {
    console.warn(
      "posts_fts could not be created; full-text search will fall back to LIKE.",
      error instanceof Error ? error.message : error,
    );
    return { fts: false };
  }
}
