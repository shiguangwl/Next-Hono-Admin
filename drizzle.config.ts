import { config } from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// WHY: drizzle-kit 是独立 CLI，不走 Next.js 的 env 加载链路
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
config({ path: envFile, override: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle config");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
