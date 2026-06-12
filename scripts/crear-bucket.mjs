// Crea los buckets públicos para imágenes. Idempotente.
// Uso: node scripts/crear-bucket.mjs
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Falta URL o SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

// "jugadores" → fotos de jugadores | "contenido" → noticias/galería/tienda
const BUCKETS = ["jugadores", "contenido"];

const { data: existentes } = await admin.storage.listBuckets();
const nombres = new Set((existentes ?? []).map((b) => b.name));

for (const bucket of BUCKETS) {
  if (nombres.has(bucket)) {
    console.log(`ℹ️  El bucket '${bucket}' ya existe.`);
    continue;
  }
  const { error } = await admin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) {
    console.error(`❌ Error creando bucket '${bucket}':`, error.message);
    process.exit(1);
  }
  console.log(`✅ Bucket '${bucket}' creado (público, máx 5MB, jpg/png/webp).`);
}
