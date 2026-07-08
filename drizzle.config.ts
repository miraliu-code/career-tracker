import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Required for `drizzle-kit migrate/push/studio`; `generate` works without it.
    url: process.env.POSTGRES_URL!,
  },
});
