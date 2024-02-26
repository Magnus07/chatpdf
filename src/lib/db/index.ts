import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true;

const DB_URL = process.env.POSTGRES_DB_URL;

if (!DB_URL) {
  throw new Error("Database URL not found");
}

const sql = neon(DB_URL);

// WARNING: TRY TO REMOVE 'AS ANY'
export const db = drizzle(sql as any);
