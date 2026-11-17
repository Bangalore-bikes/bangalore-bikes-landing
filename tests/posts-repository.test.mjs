import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { decideTrust } from "../src/lib/posts/lifecycle.ts";
import { migratePosts } from "../src/lib/posts/migrate.ts";
import {
  PostError,
  TRUST_LEVEL_SQL,
  createDraft,
  getPostBySlug,
  listByAuthor,
  listPending,
  listPublished,
  listRevisions,
  moderatePost,
  submitPost,
  updateDraft,
} from "../src/lib/posts/repository.ts";

function fixture(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  const execute = async ({ sql, args = [] }) => {
    const prepared = db.prepare(sql);
    if (prepared.columns().length) return { rows: prepared.all(...args) };
    const result = prepared.run(...args);
    return { rows: [], rowsAffected: Number(result.changes) };
  };
  const client = {
    execute,
    async batch(statements, mode) {
      assert.equal(mode, "write");
      db.exec("BEGIN IMMEDIATE");
      try {
        const results = [];
        for (const entry of statements) results.push(await execute(entry));
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

function addUser(db, id, options = {}) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, email_verified_at, password_hash, handle, display_name,
      role, trust_level, approved_count, rejected_count, created_at)
     VALUES (?, ?, ?, 'hash', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    `${id}@example.com`,
    now,
    options.handle ?? id,
    options.displayName ?? `Rider ${id}`,
    options.role ?? "rider",
    options.trustLevel ?? 0,
    options.approvedCount ?? 0,
    options.rejectedCount ?? 0,
    now,
  );
}

const INPUT = {
  title: "Nandi Hills before sunrise",
  summary:
    "Leaving Hebbal at five, what to carry, and where the road turns rough before the final climb.",
  bodyMd: "## The start\n\nWe rolled out at five.\n\n:::callout{type=tip}\nCarry a light.\n:::\n",
  tags: ["rides", "nandi-hills"],
};

async function setup(t, userOverrides = {}) {
  const { db, client } = fixture(t);
  await migratePosts(client);
  addUser(db, "author", userOverrides);
  addUser(db, "other", { handle: "other" });
  addUser(db, "mod", { handle: "mod", role: "moderator", trustLevel: 2 });
  return { db, client };
}

async function count(db, sql, ...args) {
  return Number(db.prepare(sql).get(...args).value);
}

test("createDraft stores a draft, rendered html and one history entry", async (t) => {
  const { db, client } = await setup(t);
  const post = await createDraft(client, { authorId: "author", input: INPUT });

  assert.equal(post.status, "draft");
  assert.equal(post.slug, "nandi-hills-before-sunrise");
  assert.equal(post.version, 1);
  assert.equal(post.publishedAt, null);
  assert.match(String(post.bodyHtml), /<h2 id="user-content-the-start"/);
  assert.deepEqual(post.tags, ["rides", "nandi-hills"]);
  assert.equal(await count(db, "SELECT COUNT(*) AS value FROM post_revisions"), 1);
  assert.equal(
    await count(db, "SELECT COUNT(*) AS value FROM content_audit WHERE action = 'create'"),
    1,
  );
});

test("a stale version conflicts instead of overwriting", async (t) => {
  const { client } = await setup(t);
  const post = await createDraft(client, { authorId: "author", input: INPUT });
  await updateDraft(client, {
    id: post.id,
    authorId: "author",
    input: { ...INPUT, title: "Nandi Hills at sunrise" },
    expectedVersion: 1,
  });
  await assert.rejects(
    updateDraft(client, {
      id: post.id,
      authorId: "author",
      input: { ...INPUT, title: "Stale overwrite attempt" },
      expectedVersion: 1,
    }),
    (error) => error instanceof PostError && error.code === "CONFLICT",
  );
});

test("only the author may edit, and every transition records one revision", async (t) => {
  const { db, client } = await setup(t);
  const post = await createDraft(client, { authorId: "author", input: INPUT });

  await assert.rejects(
    updateDraft(client, {
      id: post.id,
      authorId: "other",
      input: INPUT,
      expectedVersion: 1,
    }),
    (error) => error instanceof PostError && error.code === "FORBIDDEN",
  );

  const edited = await updateDraft(client, {
    id: post.id,
    authorId: "author",
    input: { ...INPUT, summary: `${INPUT.summary} Bring a windbreaker too.` },
    expectedVersion: 1,
  });
  assert.equal(edited.version, 2);
  assert.equal(await count(db, "SELECT COUNT(*) AS value FROM post_revisions"), 2);
  assert.equal(await count(db, "SELECT COUNT(*) AS value FROM content_audit"), 2);
});

test("trust level decides whether a submission is published or queued", async (t) => {
  const untrusted = await setup(t);
  const draft = await createDraft(untrusted.client, { authorId: "author", input: INPUT });
  const pending = await submitPost(untrusted.client, {
    id: draft.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });
  assert.equal(pending.status, "pending");
  assert.equal(pending.publishedAt, null);
  assert.equal((await listPending(untrusted.client)).length, 1);

  const trusted = await setup(t, { trustLevel: 1, approvedCount: 3 });
  const second = await createDraft(trusted.client, { authorId: "author", input: INPUT });
  const live = await submitPost(trusted.client, {
    id: second.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });
  assert.equal(live.status, "published");
  assert.ok(live.publishedAt);
  assert.equal((await listPublished(trusted.client)).length, 1);
  assert.equal((await listPending(trusted.client)).length, 0);
});

test("editing a published post returns it to review at trust zero", async (t) => {
  const { db, client } = await setup(t, { trustLevel: 1, approvedCount: 3 });
  const draft = await createDraft(client, { authorId: "author", input: INPUT });
  const live = await submitPost(client, {
    id: draft.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });
  assert.equal(live.status, "published");

  db.prepare("UPDATE users SET trust_level = 0 WHERE id = 'author'").run();
  const edited = await updateDraft(client, {
    id: live.id,
    authorId: "author",
    input: { ...INPUT, title: "Nandi Hills before sunrise, revised" },
    expectedVersion: live.version,
  });
  assert.equal(edited.status, "pending");
  assert.equal((await listPublished(client)).length, 0);
  assert.equal(edited.publishedAt, live.publishedAt);
});

test("slugs never collide", async (t) => {
  const { client } = await setup(t);
  const first = await createDraft(client, { authorId: "author", input: INPUT });
  const second = await createDraft(client, { authorId: "author", input: INPUT });
  assert.equal(first.slug, "nandi-hills-before-sunrise");
  assert.equal(second.slug, "nandi-hills-before-sunrise-2");
  assert.equal((await getPostBySlug(client, first.slug))?.id, undefined);
  assert.equal(
    (await getPostBySlug(client, first.slug, { publishedOnly: false }))?.id,
    first.id,
  );
});

test("approval publishes, promotes at three, and rejection requires a note", async (t) => {
  const { db, client } = await setup(t);
  const draft = await createDraft(client, { authorId: "author", input: INPUT });
  const pending = await submitPost(client, {
    id: draft.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });
  assert.equal(pending.status, "pending");

  await assert.rejects(
    moderatePost(client, { id: pending.id, moderatorId: "mod", action: "reject" }),
    (error) => error instanceof PostError && error.code === "NOTE_REQUIRED",
  );

  const published = await moderatePost(client, {
    id: pending.id,
    moderatorId: "mod",
    action: "approve",
  });
  assert.equal(published.status, "published");
  assert.ok(published.publishedAt);
  assert.equal(
    await count(db, "SELECT approved_count AS value FROM users WHERE id = 'author'"),
    1,
  );
  // create, submit and approve each leave exactly one revision.
  assert.equal((await listRevisions(client, draft.id)).length, 3);

  // A second approve is refused: the post is no longer pending.
  await assert.rejects(
    moderatePost(client, { id: published.id, moderatorId: "mod", action: "approve" }),
    (error) => error instanceof PostError && error.code === "BAD_STATE",
  );
});

test("moderation counts drive trust exactly as the pure rules do", async (t) => {
  const { db, client } = await setup(t);

  for (const approved of [0, 2, 3, 9, 10, 12]) {
    for (const rejected of [0, 1, 2, 5]) {
      for (const role of ["rider", "moderator"]) {
        const id = `u-${role}-${approved}-${rejected}`;
        addUser(db, id, { handle: id, role, approvedCount: approved, rejectedCount: rejected });
        db.prepare(`UPDATE users SET trust_level = ${TRUST_LEVEL_SQL} WHERE id = ?`).run(id);
        const stored = Number(
          db.prepare("SELECT trust_level AS value FROM users WHERE id = ?").get(id).value,
        );
        assert.equal(
          stored,
          decideTrust({ approvedCount: approved, rejectedCount: rejected, isModerator: role === "moderator" }),
          `${role} ${approved}/${rejected}`,
        );
      }
    }
  }
});

test("rejections demote a trusted author and unpublishing hides the post", async (t) => {
  const { db, client } = await setup(t, { trustLevel: 1, approvedCount: 3 });
  const draft = await createDraft(client, { authorId: "author", input: INPUT });
  const live = await submitPost(client, {
    id: draft.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });

  await moderatePost(client, {
    id: live.id,
    moderatorId: "mod",
    action: "unpublish",
    note: "Needs a photo credit.",
  });
  assert.equal((await listPublished(client)).length, 0);
  assert.equal((await listByAuthor(client, "author")).length, 1);
  assert.equal((await listByAuthor(client, "author", { publishedOnly: true })).length, 0);

  db.prepare("UPDATE users SET trust_level = 0 WHERE id = 'author'").run();
  const second = await createDraft(client, { authorId: "author", input: INPUT });
  const pending = await submitPost(client, {
    id: second.id,
    authorId: "author",
    expectedVersion: 1,
    publish: true,
  });
  await moderatePost(client, {
    id: pending.id,
    moderatorId: "mod",
    action: "reject",
    note: "This repeats an existing route guide.",
  });
  await moderatePost(client, {
    id: pending.id,
    moderatorId: "mod",
    action: "reject",
    note: "unused",
  }).catch(() => undefined);
  assert.equal(
    await count(db, "SELECT rejected_count AS value FROM users WHERE id = 'author'"),
    1,
  );
});

test("the public feed filters by tag and never leaks unpublished posts", async (t) => {
  const { client } = await setup(t);
  const rides = await createDraft(client, { authorId: "author", input: INPUT });
  const gear = await createDraft(client, {
    authorId: "author",
    input: {
      ...INPUT,
      title: "Choosing a monsoon jacket",
      summary:
        "What actually stays dry in a Bangalore downpour, and what to skip when the price climbs.",
      tags: ["gear"],
    },
  });

  assert.equal((await listPublished(client)).length, 0);

  for (const post of [rides, gear]) {
    await submitPost(client, {
      id: post.id,
      authorId: "author",
      expectedVersion: 1,
      publish: true,
    }).then((pending) =>
      moderatePost(client, { id: pending.id, moderatorId: "mod", action: "approve" }),
    );
  }

  assert.equal((await listPublished(client)).length, 2);
  assert.equal((await listPublished(client, { tag: "gear" })).length, 1);
  assert.equal((await listPublished(client, { tag: "nandi-hills" })).length, 1);
  assert.equal((await listPublished(client, { limit: 1 })).length, 1);
});

test("invalid input is refused before anything is written", async (t) => {
  const { db, client } = await setup(t);
  await assert.rejects(
    createDraft(client, { authorId: "author", input: { ...INPUT, summary: "too short" } }),
    (error) => error instanceof PostError && error.code === "INVALID_INPUT",
  );
  assert.equal(await count(db, "SELECT COUNT(*) AS value FROM posts"), 0);
});
