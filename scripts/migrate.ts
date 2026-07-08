import { neon, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });
config();

async function main() {
  // Node's built-in fetch ignores HTTPS_PROXY; route Neon's queries through
  // the proxy when one is configured (e.g. sandboxed/corporate environments
  // that only allow proxied egress).
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    const { fetch: proxiedFetch, EnvHttpProxyAgent } = await import("undici");
    const dispatcher = new EnvHttpProxyAgent();
    neonConfig.fetchFunction = (url: string, init: Record<string, unknown>) =>
      proxiedFetch(url, { ...init, dispatcher });
  }

  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Neither POSTGRES_URL nor DATABASE_URL environment variable is set",
    );
  }

  const db = drizzle(neon(connectionString));
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied successfully");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
