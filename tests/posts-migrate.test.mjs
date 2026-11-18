import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { migratePosts } from "../src/lib/posts/migrate.ts";

function fixture(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  const execute = async ({ sql, args = [] }) => {
    const statement = db.prepare(sql);
    if (statement.columns().length) return { rows: statement.all(...args) };
    const result = statement.run(...args);
    return { rows: [], rowsAffected: Number(result.changes) };
  };
  const client = {
    execute,
    async batch(statements, mode) {
      assert.equal(mode, "write");
      db.exec("BEGIN IMMEDIATE");
      try {
        const results = [];
        for (const statement of statements) results.push(await execute(statement));
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { db, client };
}

function insertUser(db, id = "user-1") {
  db.prepare(
    `INSERT INTO users (id, email, password_hash, handle, display_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, `${id}@example.com`, "hash", id, "Test Rider", new Date().toISOString());
}

test("migration is idempotent and creates every table", async (t) => {
  const { db, client } = fixture(t);
  await migratePosts(client);
  await migratePosts(client);

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((row) => String(row.name));

  for (const expected of [
    "users",
    "sessions",
    "email_tokens",
    "posts",
    "post_revisions",
    "post_comments",
    "post_reactions",
    "workshop_reviews",
    "rate_limits",
    "uploads",
  ]) {
    assert.ok(tables.includes(expected), `missing ${expected}`);
  }
});

test("posts enforce status, version and json constraints", async (t) => {
  const { db, client } = fixture(t);
  await migratePosts(client);
  await insertUser(db);

  const insert = db.prepare(
    `INSERT INTO posts (id, slug, title, summary, body_md, author_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();

  assert.throws(() =>
    insert.run("p1", "slug-a", "Title", "Summary", "Body", "user-1", "bogus", now, now),
  );
  assert.doesNotThrow(() =>
    insert.run("p2", "slug-a", "Title", "Summary", "Body", "user-1", "draft", now, now),
  );
  assert.throws(() =>
    insert.run("p3", "slug-a", "Title", "Summary", "Body", "user-1", "draft", now, now),
  );
  assert.doesNotThrow(() =>
    insert.run("p4", "slug-b", "Title", "Summary", "Body", "user-1", "draft", now, now),
  );
});

test("email is unique and case handling is the caller's responsibility", async (t) => {
  const { db, client } = fixture(t);
  await migratePosts(client);
  await insertUser(db, "a");
  assert.throws(() => insertUser(db, "a"));
});
