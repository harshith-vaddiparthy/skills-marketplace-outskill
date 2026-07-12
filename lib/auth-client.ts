"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client. Points at the same origin by default. Used
 * by the auth pages once auth is wired to a live database.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
