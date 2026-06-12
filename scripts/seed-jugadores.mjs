// Siembra jugadores de ejemplo en cada categoría hasta alcanzar un objetivo,
// respetando los jugadores reales existentes. Idempotente (no duplica si ya
// hay suficientes). Marca los de ejemplo con notas='Ejemplo'.
// Uso: node scripts/seed-jugadores.mjs
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Falta URL o SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const OBJETIVO = 15; // jugadores por categoría

const NOMBRES = [
  "Benjamín", "Vicente", "Martín", "Agustín", "Tomás", "Matías", "Joaquín",
  "Diego", "Cristóbal", "Maximiliano", "Lucas", "Gabriel", "Bastián", "Felipe",
  "Ignacio", "Sebastián", "Emilio", "Gaspar", "Pedro", "Damián",
];
const APELLIDOS = [
  "González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva",
  "Martínez", "Sepúlveda", "Morales", "Rodríguez", "López", "Fuentes", "Araya",
  "Espinoza", "Castillo", "Tapia", "Reyes", "Vergara",
];
const PARENTESCOS = ["Madre", "Padre", "Abuelo/a", "Tutor/a"];

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rnd(arr.length)];

const { data: cats } = await sb
  .from("categorias")
  .select("id, nombre, anio_min, anio_max");

let totalCreados = 0;

for (const cat of cats ?? []) {
  const { count } = await sb
    .from("jugadores")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", cat.id);
  const faltan = OBJETIVO - (count ?? 0);
  if (faltan <= 0) {
    console.log(`ℹ️  ${cat.nombre} ya tiene ${count} jugadores, omitido`);
    continue;
  }

  const filas = [];
  for (let i = 0; i < faltan; i++) {
    const anio = cat.anio_min + rnd(cat.anio_max - cat.anio_min + 1);
    const mes = String(1 + rnd(12)).padStart(2, "0");
    const dia = String(1 + rnd(28)).padStart(2, "0");
    const nombre = pick(NOMBRES);
    const apellido = `${pick(APELLIDOS)} ${pick(APELLIDOS)}`;
    filas.push({
      nombre,
      apellido,
      fecha_nacimiento: `${anio}-${mes}-${dia}`,
      categoria_id: cat.id,
      nombre_apoderado: `${pick(["Carlos", "María", "José", "Ana", "Luis", "Carmen"])} ${pick(APELLIDOS)}`,
      parentesco_apoderado: pick(PARENTESCOS),
      telefono_apoderado: `+5697${String(rnd(100000000)).padStart(8, "0")}`,
      activo: true,
      // Foto: ~la mitad con imagen de ejemplo, el resto con placeholder
      foto_url: i % 2 === 0 ? `/banner/${1 + (i % 5)}.png` : null,
      notas: "Ejemplo (puedes eliminarlo)",
    });
  }

  const { error } = await sb.from("jugadores").insert(filas);
  if (error) {
    console.log(`❌ ${cat.nombre}: ${error.message}`);
  } else {
    totalCreados += filas.length;
    console.log(`✅ ${cat.nombre}: +${filas.length} jugadores de ejemplo`);
  }
}

console.log(`\nTotal jugadores de ejemplo creados: ${totalCreados}`);
