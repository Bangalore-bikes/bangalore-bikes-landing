import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { createRateLimiter } from "../src/lib/rate-limit.ts";

function fixture(t, options) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  db.exec(`CREATE TABLE rate_limits (
    key TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (key, window_start)
  )`);
  const client = {
    async execute({ sql, args = [] }) {
      const statement = db.prepare(sql);
      if (statement.columns().length) return { rows: statement.all(...args) };
      const result = statement.run(...args);
      return { rows: [], rowsAffected: Number(result.changes) };
    },
    async batch() {
      throw new Error("rate limiting never batches");
    },
  };
  return createRateLimiter(client, options);
}

test("limits report the real remaining window and reset only the intended key", async (t) => {
  let timestamp = 60_000;
  const limiter = fixture(t, { now: () => timestamp });
  await limiter.hit("first", 1, 60);
  timestamp = 119_000;
  const result = await limiter.hit("first", 1, 60);
  assert.equal(result.allowed, false);
  assert.equal(result.retryAfter, 1);
  await limiter.hit("second", 1, 60);
  await limiter.reset("first", 60);
  assert.equal((await limiter.hit("first", 1, 60)).allowed, true);
  assert.equal((await limiter.hit("second", 1, 60)).allowed, false);
  timestamp = 120_000;
  assert.equal((await limiter.hit("second", 1, 60)).allowed, true);
});

test("the limit is enforced inside a window and keys stay independent", async (t) => {
  const limiter = fixture(t);
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await limiter.hit("login:alice", 5, 900);
    assert.equal(result.allowed, true, `attempt ${attempt} should be allowed`);
    assert.equal(result.remaining, 5 - attempt);
  }
  const blocked = await limiter.hit("login:alice", 5, 900);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);

  const other = await limiter.hit("login:bob", 5, 900);
  assert.equal(other.allowed, true);
  assert.equal(other.remaining, 4);
});

test("invalid configuration is rejected rather than silently unbounded", async (t) => {
  const limiter = fixture(t);
  await assert.rejects(limiter.hit("", 5, 900));
  await assert.rejects(limiter.hit("key", 0, 900));
  await assert.rejects(limiter.hit("key", 5, 0));
});
