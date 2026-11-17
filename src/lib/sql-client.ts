import type {
  Client,
  InStatement,
  ResultSet,
  Value,
} from "@libsql/client";

import type {
  SqlClient,
  SqlResult,
  SqlStatement,
  SqlValue,
} from "./content-store";

export type RemoteClient = Pick<Client, "execute" | "batch">;

function args(statement: SqlStatement): Value[] | undefined {
  return statement.args as Value[] | undefined;
}

function result(set: ResultSet): SqlResult {
  return {
    rows: set.rows as SqlResult["rows"],
    rowsAffected: set.rowsAffected,
  };
}

/**
 * Adapts a libSQL client to the narrow repository contract. libSQL batches are
 * atomic write transactions, which the repository relies on.
 */
export function toStoreClient(client: RemoteClient): SqlClient {
  return {
    async execute(statement) {
      return result(await client.execute(statement as InStatement));
    },
    async batch(statements, mode) {
      const sets = await client.batch(
        statements.map((statement) => ({
          sql: statement.sql,
          args: args(statement),
        })),
        mode,
      );
      return sets.map(result);
    },
  };
}

export type { SqlValue };
