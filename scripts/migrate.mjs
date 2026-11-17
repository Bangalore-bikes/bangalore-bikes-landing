#!/usr/bin/env node
/**
 * Initialize the managed content database and seed it from repository JSON.
 *
 * Usage: npm run db:migrate [-- --force]
 *
 * Safety: refuses to touch a database that contains unrelated tables unless
 * --force is supplied. Re-running is safe: schema creation is idempotent and
 * seed markers plus tombstones prevent content resurrection.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";

import { parseArticles } from "../src/lib/articleSchema.ts";
import { createContentStore } from "../src/lib/content-store.ts";
import { parseResourceCollection } from "../src/lib/resourceSchema.ts";
import { parseRides } from "../src/lib/rideSchema.ts";
import { toStoreClient } from "../src/lib/sql-client.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const force = process.argv.includes("--force");
const knownTables = new Set([
  "content_records",
  "content_audit",
  "content_migrations",
]);

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

function readJson(name) {
  return JSON.parse(readFileSync(join(root, "src", "data", name), "utf8"));
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
  abort(
    "TURSO_AUTH_TOKEN is not set. A remote libSQL database requires a write token.",
  );
}

const articles = parseArticles(readJson("articles.json"));
const rides = parseRides(readJson("rides.json"));
const resources = parseResourceCollection(readJson("resources.json"));

const client = createClient(authToken ? { url, authToken } : { url });
const store = createContentStore(toStoreClient(client));

try {
  const target = new URL(url);
  console.log(
    `Target: ${target.protocol}//${target.host}${target.pathname === "/" ? "" : target.pathname}`,
  );

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );
  const unexpected = tables.rows
    .map((row) => String(row.name))
    .filter((name) => !knownTables.has(name));

  if (unexpected.length > 0 && !force) {
    abort(
      `The target database contains unrelated tables (${unexpected.join(
        ", ",
      )}). Re-run with --force only after confirming this is the intended database.`,
    );
  }

  await store.migrate();

  await store.seedOnce(
    {
      articles: articles.map((article) => ({
        id: article.slug,
        data: article,
        published: article.status === "published",
      })),
      rides: rides.map((ride) => ({
        id: ride.slug,
        data: ride,
        published: true,
      })),
      resources: resources.map((resource) => ({
        id: resource.id,
        data: resource,
        published: resource.status === "published",
      })),
    },
    "migration",
  );

  for (const collection of ["articles", "rides", "resources"]) {
    const all = await store.list(collection, "all");
    const visible = all.filter((record) => record.published).length;
    console.log(
      `${collection}: ${all.length} stored, ${visible} public`,
    );
  }
  console.log("\nContent database is initialized.");
} catch (error) {
  abort(error instanceof Error ? error.message : String(error));
} finally {
  client.close();
}
