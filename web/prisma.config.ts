import path from "node:path";
import { existsSync } from "node:fs";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Always load web/.env next to this file (do not depend on shell cwd).
const envPath = path.join(__dirname, ".env");
const result = config({ path: envPath });

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  const parsedKeys = Object.keys(result.parsed ?? {});
  const hint = !existsSync(envPath)
    ? `No file at ${envPath}. Copy .env.example to .env and fill in your Supabase values.`
    : parsedKeys.length === 0
      ? `Found ${envPath} but it has no KEY=value entries (empty, unsaved, or wrong encoding). Re-save it as UTF-8.`
      : `Found ${envPath} with keys: ${parsedKeys.join(", ")}. Add DATABASE_URL (and preferably DIRECT_URL).`;

  throw new Error(`Prisma datasource URL missing.\n${hint}`);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL (session mode) for db push / migrate; pooler URL often fails for schema ops.
    url: databaseUrl,
  },
});
