import { DatabaseSync } from "node:sqlite";
import { migratePosts } from "../../src/lib/posts/migrate.ts";
import { createAuthService } from "../../src/lib/auth/service.ts";

export async function authFixture(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  const execute = async ({ sql, args = [] }) => {
    const prepared = db.prepare(sql);
    if (prepared.columns().length) return { rows: prepared.all(...args) };
    return { rows: [], rowsAffected: Number(prepared.run(...args).changes) };
  };
  let tail = Promise.resolve();
  const client = {
    execute,
    batch(statements) {
      const run = tail.then(async () => {
        db.exec("BEGIN IMMEDIATE");
        try {
          const rows = [];
          for (const statement of statements)
            rows.push(await execute(statement));
          db.exec("COMMIT");
          return rows;
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      });
      tail = run.catch(() => {});
      return run;
    },
  };
  await migratePosts(client);
  let timestamp = Date.parse("2026-11-17T12:00:00Z");
  const now = () => new Date(timestamp);
  const encryptionKey = "a1".repeat(32);
  const messages = [];
  const auth = createAuthService({
    client,
    encryptionKey,
    now,
    baseUrl: "https://example.com",
    mail: {
      configured: true,
      async send(message) {
        messages.push(message);
      },
    },
  });
  const password = "a safe test-only passphrase";
  await auth.signUp({
    email: "rider@example.com",
    displayName: "Test Rider",
    password,
  });
  const token = /token=([A-Za-z0-9_-]+)/.exec(messages[0].text)[1];
  const { user, session } = await auth.verifyEmail(token);
  return {
    db,
    client,
    auth,
    user,
    session,
    password,
    messages,
    now,
    encryptionKey,
    advance(seconds) {
      timestamp += seconds * 1000;
    },
  };
}
