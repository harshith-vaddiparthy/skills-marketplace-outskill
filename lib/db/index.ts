import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and set it " +
      "(local Docker via `docker compose up -d`, or a Neon connection string).",
  );
}

// A single postgres-js client, reused across hot reloads in dev to avoid
// exhausting connections. Works unchanged against local Postgres and Neon
// (Neon requires `?sslmode=require` in the URL).
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__pgClient ??
  postgres(connectionString, { max: 10, prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgClient = client;
}

export const db = drizzle(client, { schema });

export type Database = typeof db;
