import type { SqlClient } from "./content-store.ts";

export type RateLimitResult = { allowed: boolean; remaining: number };

/**
 * Fixed-window counters stored in the database rather than memory, because
 * serverless hosts give each request a fresh process. Keys are chosen by the
 * caller and never contain personal data; hash an address before passing it.
 */
export function createRateLimiter(client: SqlClient) {
  return {
    async hit(
      key: string,
      limit: number,
      windowSeconds: number,
    ): Promise<RateLimitResult> {
      if (!key.trim()) throw new Error("A rate limit key is required");
      if (!Number.isSafeInteger(limit) || limit < 1) {
        throw new Error("A positive limit is required");
      }
      if (!Number.isSafeInteger(windowSeconds) || windowSeconds < 1) {
        throw new Error("A positive window is required");
      }

      const windowStart =
        Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
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
      };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
