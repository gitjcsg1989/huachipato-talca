import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // No tirar en build: las páginas que usan Supabase server client no necesitan Drizzle.
  console.warn("DATABASE_URL no definida — el cliente Drizzle no funcionará.");
}

// `prepare: false` es requerido para el pooler de Supabase (transaction mode).
const client = postgres(connectionString ?? "", { prepare: false });

export const db = drizzle(client, { schema });

export * from "./schema";
