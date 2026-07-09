import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Node's built-in fetch ignores HTTPS_PROXY; route Neon's queries through
// the proxy when one is configured (e.g. sandboxed/corporate environments
// that only allow proxied egress). On Vercel this branch is skipped.
if (process.env.HTTPS_PROXY || process.env.https_proxy) {
  let dispatcher: import("undici").EnvHttpProxyAgent | undefined;
  neonConfig.fetchFunction = async (
    url: string,
    init: Record<string, unknown>,
  ) => {
    const { fetch: proxiedFetch, EnvHttpProxyAgent } = await import("undici");
    dispatcher ??= new EnvHttpProxyAgent();
    return proxiedFetch(url, { ...init, dispatcher });
  };
}

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Neither POSTGRES_URL nor DATABASE_URL environment variable is set",
  );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
