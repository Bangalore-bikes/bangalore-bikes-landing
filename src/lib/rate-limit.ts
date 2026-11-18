import type { SqlClient } from "./content-store.ts";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

/**
 * Fixed-window counters stored in the database rather than memory, because
 * serverless hosts give each request a fresh process. Keys are chosen by the
 * caller and never contain personal data; hash an address before passing it.
 */
export function createRateLimiter(
  client: SqlClient,
  options: { now?: () => number } = {},
) {
  const now = options.now ?? Date.now;
  return {
    async reset(key: string, windowSeconds: number): Promise<void> {
      const windowStart =
        Math.floor(now() / 1000 / windowSeconds) * windowSeconds;
      await client.execute({
        sql: "DELETE FROM rate_limits WHERE key = ? AND window_start = ?",
        args: [key, windowStart],
      });
    },
    async hit(
      key: string,
      limit: number,
      windowSeconds: number,
    ): Promise<RateLimitResult> {
      if (!key.trim()) throw new Error("A rate limit key is required");
      if (!Number.isSafeInteger(limit) || limit < 1) {
        throw new Error("A positive limit is required");
      }
      if (
        !Number.isSafeInteger(windowSeconds) ||
        windowSeconds < 1 ||
        windowSeconds > 86_400
      ) {
        throw new Error("A positive window is required");
      }

      const nowSeconds = Math.floor(now() / 1000);
      const windowStart =
        Math.floor(nowSeconds / windowSeconds) * windowSeconds;
      await client.execute({
        sql: "DELETE FROM rate_limits WHERE window_start < ?",
        args: [nowSeconds - 172_800],
      });
      const result = await client.execute({
        sql: `INSERT INTO rate_limits (key, window_start, count)
              VALUES (?, ?, 1)
              ON CONFLICT(key, window_start)
              DO UPDATE SET count = count + 1
              RETURNING count`,
        args: [key, windowStart],
      });

      const count = Number(result.rows[0]?.count ?? 1);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfter: Math.max(1, windowStart + windowSeconds - nowSeconds),
      };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
