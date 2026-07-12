import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // Kept simple for the beta — no email round-trip required to sign in.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
  // NOTE (future CLI seam): when the install CLI is built, add the `bearer`
  // plugin here plus an `api_key` table so `npx <cli> add <skill>` can present
  // a per-user token that the registry validates against purchase entitlements.
});

export type Session = typeof auth.$Infer.Session;
