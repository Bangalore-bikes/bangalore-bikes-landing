import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { migratePosts } from "../src/lib/posts/migrate.ts";
import { createAuthService, AuthError } from "../src/lib/auth/service.ts";
import { findUserByEmail } from "../src/lib/auth/repository.ts";

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

async function setup(t, options = {}) {
  const { db, client } = fixture(t);
  await migratePosts(client);
  const messages = [];
  const mail = {
    configured: true,
    async send(message) {
      messages.push(message);
    },
  };
  const service = createAuthService({
    client,
    mail,
    baseUrl: "https://bangalorebikes.com",
    adminEmails: options.adminEmails,
  });
  return { db, client, messages, service };
}

function tokenFrom(message) {
  const match = /token=([A-Za-z0-9_-]+)/.exec(message.text);
  assert.ok(match, "mail should carry a token link");
  return match[1];
}

const PASSWORD = "a long enough passphrase";

test("signup creates an unverified account and mails a single link", async (t) => {
  const { service, messages, client } = await setup(t);
  const { user, mailSent } = await service.signUp({
    email: "Rider@Example.com",
    password: PASSWORD,
    displayName: "Asha Rao",
  });

  assert.equal(mailSent, true);
  assert.equal(user.email, "rider@example.com");
  assert.equal(user.handle, "asha-rao");
  assert.equal(user.emailVerified, false);
  assert.equal(messages.length, 1);
  assert.match(messages[0].subject, /Confirm/);
  assert.deepEqual(messages[0].to, "rider@example.com");

  const stored = await findUserByEmail(client, "rider@example.com");
  assert.match(String(stored?.passwordHash), /^\$argon2id\$/);
  assert.notEqual(stored?.passwordHash, PASSWORD);

  await assert.rejects(
    service.signUp({
      email: "rider@example.com",
      password: PASSWORD,
      displayName: "Someone Else",
    }),
    (error) => error instanceof AuthError && error.code === "EMAIL_TAKEN",
  );
});

test("weak passwords are refused before anything is stored", async (t) => {
  const { service, client } = await setup(t);
  await assert.rejects(
    service.signUp({ email: "a@b.com", password: "short", displayName: "Asha" }),
    (error) => error instanceof AuthError && error.code === "WEAK_PASSWORD",
  );
  assert.equal(await findUserByEmail(client, "a@b.com"), null);
});

test("an unverified account cannot sign in, and verifying signs it in", async (t) => {
  const { service, messages } = await setup(t);
  await service.signUp({
    email: "rider@example.com",
    password: PASSWORD,
    displayName: "Asha Rao",
  });

  await assert.rejects(
    service.logIn({ email: "rider@example.com", password: PASSWORD }),
    (error) => error instanceof AuthError && error.code === "UNVERIFIED",
  );

  const token = tokenFrom(messages[0]);
  const { user, session } = await service.verifyEmail(token);
  assert.equal(user.emailVerified, true);
  assert.ok(session.length >= 43);

  // Replaying the same confirmation link must fail.
  await assert.rejects(
    service.verifyEmail(token),
    (error) => error instanceof AuthError && error.code === "INVALID_TOKEN",
  );

  const login = await service.logIn({ email: "rider@example.com", password: PASSWORD });
  assert.equal(login.user.handle, "asha-rao");
  assert.equal((await service.currentUser(login.session)).id, login.user.id);
});

test("five failed attempts throttle the account", async (t) => {
  const { service, messages } = await setup(t);
  await service.signUp({
    email: "rider@example.com",
    password: PASSWORD,
    displayName: "Asha Rao",
  });
  await service.verifyEmail(tokenFrom(messages[0]));

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await assert.rejects(
      service.logIn({ email: "rider@example.com", password: "wrong password here" }),
      (error) => error instanceof AuthError && error.code === "INVALID_CREDENTIALS",
    );
  }

  await assert.rejects(
    service.logIn({ email: "rider@example.com", password: PASSWORD }),
    (error) => error instanceof AuthError && error.code === "THROTTLED",
  );

  // A different account is unaffected by the first account's failures.
  await service.signUp({
    email: "other@example.com",
    password: PASSWORD,
    displayName: "Other Rider",
  });
  await service.verifyEmail(tokenFrom(messages[1]));
  const login = await service.logIn({ email: "other@example.com", password: PASSWORD });
  assert.ok(login.session);
});

test("a reset link works once and signs out every existing session", async (t) => {
  const { service, messages } = await setup(t);
  await service.signUp({
    email: "rider@example.com",
    password: PASSWORD,
    displayName: "Asha Rao",
  });
  await service.verifyEmail(tokenFrom(messages[0]));
  const first = await service.logIn({ email: "rider@example.com", password: PASSWORD });
  const second = await service.logIn({ email: "rider@example.com", password: PASSWORD });

  await service.requestReset({ email: "rider@example.com" });
  const reset = messages.at(-1);
  assert.match(reset.subject, /Reset/);
  const token = tokenFrom(reset);

  await service.completeReset({ token, password: "another long passphrase" });

  assert.equal(await service.currentUser(first.session), null);
  assert.equal(await service.currentUser(second.session), null);
  await assert.rejects(
    service.logIn({ email: "rider@example.com", password: PASSWORD }),
    (error) => error instanceof AuthError && error.code === "INVALID_CREDENTIALS",
  );
  const login = await service.logIn({
    email: "rider@example.com",
    password: "another long passphrase",
  });
  assert.ok(login.session);

  await assert.rejects(
    service.completeReset({ token, password: "a third long passphrase" }),
    (error) => error instanceof AuthError && error.code === "INVALID_TOKEN",
  );
});

test("a reset request for an unknown address reveals nothing", async (t) => {
  const { service, messages } = await setup(t);
  await service.requestReset({ email: "nobody@example.com" });
  assert.equal(messages.length, 0);
});

test("logout ends only the current session", async (t) => {
  const { service, messages } = await setup(t);
  await service.signUp({
    email: "rider@example.com",
    password: PASSWORD,
    displayName: "Asha Rao",
  });
  await service.verifyEmail(tokenFrom(messages[0]));
  const phone = await service.logIn({ email: "rider@example.com", password: PASSWORD });
  const laptop = await service.logIn({ email: "rider@example.com", password: PASSWORD });

  await service.logOut(phone.session);
  assert.equal(await service.currentUser(phone.session), null);
  assert.ok(await service.currentUser(laptop.session));
});

test("ADMIN_EMAILS promotes an account when it confirms its address", async (t) => {
  const { service, messages } = await setup(t, { adminEmails: ["mod@example.com"] });
  await service.signUp({
    email: "mod@example.com",
    password: PASSWORD,
    displayName: "The Moderator",
  });
  const { user } = await service.verifyEmail(tokenFrom(messages[0]));
  assert.equal(user.role, "moderator");
  assert.equal(user.trustLevel, 2);
});
