#!/usr/bin/env node
/**
 * Create the community publishing tables (users, posts, revisions, comments,
 * reactions, reviews, rate limits, uploads) in the configured libSQL database.
 *
 * Usage: npm run db:migrate:posts
 *
 * Only `CREATE ... IF NOT EXISTS` statements run. Existing content tables and
 * data are never altered or dropped, and re-running is a no-op.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";

import { migratePosts } from "../src/lib/posts/migrate.ts";
import { toStoreClient } from "../src/lib/sql-client.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function abort(message) {
  console.error(`\nAborted: ${message}\n`);
  process.exit(1);
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url) {
  abort(
    "TURSO_DATABASE_URL is not set. Configure the intended database first; see docs/activation-guide.md.",
  );
}
if (!url.startsWith("file:") && !authToken) {
  abort("TURSO_AUTH_TOKEN is not set. A remote database requires a write token.");
}

const client = createClient(authToken ? { url, authToken } : { url });

try {
  const target = new URL(url);
  console.log(
    `Target: ${target.protocol}//${target.host}${target.pathname === "/" ? "" : target.pathname}`,
  );

  const report = await migratePosts(toStoreClient(client));

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  console.log(`Tables: ${tables.rows.map((row) => String(row.name)).join(", ")}`);
  console.log(
    report.fts
      ? "Full-text search: posts_fts ready."
      : "Full-text search: not available in this build; search falls back to LIKE.",
  );
  console.log("\nCommunity publishing tables are ready.");
} catch (error) {
  abort(error instanceof Error ? error.message : String(error));
} finally {
  client.close();
}
