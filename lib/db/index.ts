import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// A single postgres-js client, reused across hot reloads in dev to avoid
// exhausting connections. Works unchanged against local Postgres and Neon
// (Neon requires `?sslmode=require` in the URL).
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
  __db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Deferred to first use so importing this module never throws — the app
    // can build and render sample-data pages without a live database.
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set it " +
        "(local Docker via `docker compose up -d`, or a Neon connection string).",
    );
  }
  const client =
    globalForDb.__pgClient ??
    postgres(connectionString, { max: 10, prepare: false });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__pgClient = client;
  }
  return drizzle(client, { schema });
}

/**
 * Lazy database handle. The connection is created on first property access, so
 * modules can import `db` freely; only an actual query requires DATABASE_URL.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    if (!globalForDb.__db) globalForDb.__db = createDb();
    return Reflect.get(globalForDb.__db, prop, receiver);
  },
});

export type Database = ReturnType<typeof drizzle<typeof schema>>;
