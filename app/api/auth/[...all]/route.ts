import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth mounts all its endpoints (sign-in, sign-up, session, etc.) here.
// Inert until DATABASE_URL is configured — the db handle is lazy, so importing
// this route never throws; a request only touches the DB when auth runs.
export const { GET, POST } = toNextJsHandler(auth);
