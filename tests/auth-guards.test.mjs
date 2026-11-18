import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { migratePosts } from "../src/lib/posts/migrate.ts";
import { createAuthService } from "../src/lib/auth/service.ts";
import { requireModerator, requireUser } from "../src/lib/auth/guards.ts";
import { SESSION_COOKIE } from "../src/lib/auth/session.ts";

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

function requestWith(token) {
  return new Request("https://bangalorebikes.com/api/posts", {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
  });
}

async function signIn(t, options = {}) {
  const { db, client } = fixture(t);
  await migratePosts(client);
  const messages = [];
  const service = createAuthService({
    client,
    mail: {
      configured: true,
      async send(message) {
        messages.push(message);
      },
    },
    baseUrl: "https://bangalorebikes.com",
    adminEmails: options.adminEmails,
  });
  await service.signUp({
    email: options.email ?? "rider@example.com",
    password: options.password ?? "a long enough passphrase",
    displayName: options.displayName ?? "Asha Rao",
  });
  const token = /token=([A-Za-z0-9_-]+)/.exec(messages[0].text)[1];
  const { session } = await service.verifyEmail(token);
  return { db, client, service, session };
}

test("no cookie is unauthorised", async (t) => {
  const { client } = await signIn(t);
  const guard = await requireUser(requestWith(null), client);
  assert.equal(guard.ok, false);
  assert.equal(guard.status, 401);
});

test("a valid session resolves the rider", async (t) => {
  const { client, session } = await signIn(t);
  const guard = await requireUser(requestWith(session), client);
  assert.equal(guard.ok, true);
  if (guard.ok) {
    assert.equal(guard.user.handle, "asha-rao");
    assert.equal(guard.user.trustLevel, 0);
  }
});

test("a moderator guard refuses riders", async (t) => {
  const { client, session } = await signIn(t);
  const guard = await requireModerator(requestWith(session), client);
  assert.equal(guard.ok, false);
  assert.equal(guard.status, 403);
});

test("a session revoked after sign-in is refused on the next request", async (t) => {
  const { db, client, session } = await signIn(t);
  assert.equal((await requireUser(requestWith(session), client)).ok, true);

  db.prepare("DELETE FROM sessions").run();
  const guard = await requireUser(requestWith(session), client);
  assert.equal(guard.ok, false);
  assert.equal(guard.status, 401);
});

test("a disabled account is refused even with a live session", async (t) => {
  const { db, client, session } = await signIn(t);
  db.prepare("UPDATE users SET disabled_at = ?").run(new Date().toISOString());
  const guard = await requireUser(requestWith(session), client);
  assert.equal(guard.ok, false);
  assert.equal(guard.status, 401);
});
