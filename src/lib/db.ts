import { createClient } from "@libsql/client";

import { createContentStore, type ContentStore } from "./content-store";
import { toStoreClient, type RemoteClient } from "./sql-client";

let cachedClient: RemoteClient | null = null;
let cachedStore: ContentStore | null = null;

export function databaseUrl() {
  return process.env.TURSO_DATABASE_URL?.trim() || "";
}

function databaseToken() {
  return process.env.TURSO_AUTH_TOKEN?.trim() || "";
}

/**
 * A remote database needs a URL and token. A `file:` URL is accepted for local
 * development and tests only; serverless hosts cannot persist local files.
 */
export function hasDatabaseConfig() {
  const url = databaseUrl();
  if (!url) return false;
  return url.startsWith("file:") || Boolean(databaseToken());
}

export function getRemoteClient(): RemoteClient {
  if (cachedClient) return cachedClient;
  const url = databaseUrl();
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not configured");
  }
  const authToken = databaseToken();
  if (!url.startsWith("file:") && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is not configured");
  }
  cachedClient = createClient(
    authToken ? { url, authToken } : { url },
  ) as RemoteClient;
  return cachedClient;
}

export function getContentStore(): ContentStore {
  if (cachedStore) return cachedStore;
  cachedStore = createContentStore(toStoreClient(getRemoteClient()));
  return cachedStore;
}

/** Test helper: drop the module-level client so a new URL takes effect. */
export function resetDatabaseClient() {
  cachedClient = null;
  cachedStore = null;
}
