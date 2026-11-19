import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { migratePosts } from "../src/lib/posts/migrate.ts";
import {
  CommentError,
  MAX_COMMENT_LENGTH,
  addComment,
  cleanComment,
  deleteComment,
  listComments,
} from "../src/lib/posts/comments.ts";

function fixture(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  const execute = async ({ sql, args = [] }) => {
    const prepared = db.prepare(sql);
    if (prepared.columns().length) return { rows: prepared.all(...args) };
    const result = prepared.run(...args);
    return { rows: [], rowsAffected: Number(result.changes) };
  };
  return { db, client: { execute, async batch(s) { return Promise.all(s.map(execute)); } } };
}

async function seed(t) {
  const { db, client } = fixture(t);
  await migratePosts(client);
  const now = new Date().toISOString();
  for (const [id, role] of [["ann", "rider"], ["bob", "rider"], ["mod", "moderator"]]) {
    db.prepare(
      `INSERT INTO users (id,email,password_hash,handle,display_name,role,created_at) VALUES (?,?, 'h',?,?,?,?)`,
    ).run(id, `${id}@x.com`, id, id.toUpperCase(), role, now);
  }
  db.prepare(
    `INSERT INTO posts (id,slug,title,summary,body_md,author_id,status,published_at,created_at,updated_at)
     VALUES ('p1','p','T','S','B','ann','published',?,?,?)`,
  ).run(now, now, now);
  db.prepare(
    `INSERT INTO posts (id,slug,title,summary,body_md,author_id,status,created_at,updated_at)
     VALUES ('p2','q','T','S','B','ann','draft',?,?)`,
  ).run(now, now);
  return { db, client };
}

test("cleanComment trims, collapses blank runs and enforces the limit", () => {
  assert.equal(cleanComment("  hi\r\n\n\n\nthere  "), "hi\n\nthere");
  assert.throws(() => cleanComment("   "), CommentError);
  assert.throws(() => cleanComment(42), CommentError);
  assert.throws(() => cleanComment("x".repeat(MAX_COMMENT_LENGTH + 1)), CommentError);
});

test("a comment on a published post is listed with its author", async (t) => {
  const { client } = await seed(t);
  await addComment(client, { postId: "p1", authorId: "bob", body: "Great route <b>x</b>" });
  const list = await listComments(client, "p1");
  assert.equal(list.length, 1);
  assert.equal(list[0].body, "Great route <b>x</b>");
  assert.equal(list[0].author.handle, "bob");
});

test("comments are refused on unpublished or missing posts", async (t) => {
  const { client } = await seed(t);
  await assert.rejects(addComment(client, { postId: "p2", authorId: "bob", body: "hi" }), { code: "NOT_FOUND" });
  await assert.rejects(addComment(client, { postId: "nope", authorId: "bob", body: "hi" }), { code: "NOT_FOUND" });
});

test("only the author or a moderator can remove a comment", async (t) => {
  const { client } = await seed(t);
  const id = await addComment(client, { postId: "p1", authorId: "bob", body: "mine" });
  await assert.rejects(
    deleteComment(client, { commentId: id, user: { id: "ann", role: "rider" } }),
    { code: "FORBIDDEN" },
  );
  await deleteComment(client, { commentId: id, user: { id: "bob", role: "rider" } });
  assert.equal((await listComments(client, "p1")).length, 0);

  const second = await addComment(client, { postId: "p1", authorId: "bob", body: "again" });
  await deleteComment(client, { commentId: second, user: { id: "mod", role: "moderator" } });
  assert.equal((await listComments(client, "p1")).length, 0);
  await assert.rejects(
    deleteComment(client, { commentId: second, user: { id: "mod", role: "moderator" } }),
    { code: "NOT_FOUND" },
  );
});

test("comments from disabled accounts are hidden", async (t) => {
  const { db, client } = await seed(t);
  await addComment(client, { postId: "p1", authorId: "bob", body: "hi" });
  db.prepare("UPDATE users SET disabled_at = ? WHERE id = 'bob'").run(new Date().toISOString());
  assert.equal((await listComments(client, "p1")).length, 0);
});
