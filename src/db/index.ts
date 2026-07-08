import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Neither POSTGRES_URL nor DATABASE_URL environment variable is set",
  );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
