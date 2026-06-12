// Inserta contenido de ejemplo (noticias, productos, galería) y rellena
// ajustes. Idempotente: solo inserta si la tabla está vacía.
// Uso: node scripts/seed-contenido.mjs
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

async function vacia(tabla) {
  const { count } = await sb.from(tabla).select("*", { count: "exact", head: true });
  return (count ?? 0) === 0;
}

// ── Noticias ──
if (await vacia("noticias")) {
  const { error } = await sb.from("noticias").insert([
    {
      titulo: "¡Campeones del torneo apertura Sub-12!",
      slug: "campeones-torneo-apertura-sub-12",
      fecha: "2026-05-28",
      categoria: "resultados",
      imagen_url: "/banner/1.png",
      extracto:
        "Nuestra Sub-12 levantó la copa tras una final cardíaca definida en los penales. ¡Orgullo azul!",
      contenido:
        "La categoría Sub-12 de la Academia Huachipato Talca se coronó campeona del Torneo Apertura tras vencer en una emocionante final definida desde los doce pasos.\n\nEl equipo mostró un fútbol sólido durante todo el campeonato. ¡Felicitaciones a jugadores, cuerpo técnico y apoderados!",
      publicada: true,
    },
    {
      titulo: "Abrimos inscripciones para la temporada 2026",
      slug: "inscripciones-temporada-2026",
      fecha: "2026-05-15",
      categoria: "comunicados",
      imagen_url: "/banner/4.png",
      extracto:
        "Ya puedes inscribir a tu hijo/a en cualquiera de nuestras categorías, desde Sub-6 hasta Sub-16.",
      contenido:
        "Las inscripciones para la temporada 2026 ya están abiertas. Contamos con categorías desde Sub-6 hasta Sub-16, con entrenadores certificados.\n\nCompleta el formulario en la sección Contacto y te contactaremos.",
      publicada: true,
    },
    {
      titulo: "Jornada de fútbol formativo en el Estadio Fiscal",
      slug: "jornada-futbol-formativo-estadio-fiscal",
      fecha: "2026-04-30",
      categoria: "eventos",
      imagen_url: "/banner/3.png",
      extracto:
        "Más de 150 niños participaron en una jornada de fútbol y valores junto a sus familias.",
      contenido:
        "El pasado fin de semana celebramos una jornada de fútbol formativo que reunió a más de 150 niños de todas nuestras categorías junto a sus familias.",
      publicada: true,
    },
  ]);
  console.log(error ? "❌ noticias: " + error.message : "✅ 3 noticias insertadas");
} else console.log("ℹ️  noticias ya tiene datos, omitido");

// ── Productos ──
if (await vacia("productos")) {
  const { error } = await sb.from("productos").insert([
    { nombre: "Camiseta Oficial 2026", descripcion: "Camiseta titular azul/negro, tela transpirable.", precio: 24990, imagen_url: "/banner/4.png", categoria: "camisetas", disponible: true, destacado: true, nuevo: true },
    { nombre: "Short Deportivo", descripcion: "Short negro de entrenamiento, secado rápido.", precio: 12990, imagen_url: "/banner/2.png", categoria: "shorts", disponible: true, destacado: true, nuevo: false },
    { nombre: "Medias Oficiales", descripcion: "Medias azules con el escudo bordado.", precio: 6990, imagen_url: "/banner/5.png", categoria: "medias", disponible: true, destacado: true, nuevo: false },
    { nombre: "Kit Completo Titular", descripcion: "Camiseta + short + medias.", precio: 39990, imagen_url: "/banner/1.png", categoria: "kits", disponible: true, destacado: true, nuevo: true },
    { nombre: "Mochila Deportiva", descripcion: "Mochila con compartimento para botines.", precio: 18990, imagen_url: "/banner/3.png", categoria: "accesorios", disponible: true, destacado: false, nuevo: false },
    { nombre: "Botella Térmica", descripcion: "Acero inoxidable 750ml con logo.", precio: 9990, imagen_url: "/banner/5.png", categoria: "accesorios", disponible: true, destacado: false, nuevo: false },
  ]);
  console.log(error ? "❌ productos: " + error.message : "✅ 6 productos insertados");
} else console.log("ℹ️  productos ya tiene datos, omitido");

// ── Galería ──
if (await vacia("galeria_fotos")) {
  const fotos = [1, 2, 3, 4, 5].map((n, i) => ({
    foto_url: `/banner/${n}.png`,
    titulo: ["Celebración del título", "Trabajo de velocidad", "Definición del partido", "Plantel", "El equipo en cancha"][i],
    orden: i,
  }));
  const { error } = await sb.from("galeria_fotos").insert(fotos);
  console.log(error ? "❌ galería: " + error.message : "✅ 5 fotos insertadas");
} else console.log("ℹ️  galería ya tiene datos, omitido");

// ── Cuerpo técnico ──
if (await vacia("cuerpo_tecnico")) {
  const { error } = await sb.from("cuerpo_tecnico").insert([
    { nombre: "Rodrigo Salinas", cargo: "Director Técnico", foto_url: "/banner/5.png", descripcion: "Entrenador con más de 10 años en fútbol formativo.", orden: 1 },
    { nombre: "Daniela Fuentes", cargo: "Preparadora Física", foto_url: "/banner/2.png", descripcion: "Kinesióloga especialista en deporte infantil.", orden: 2 },
    { nombre: "Marco Vergara", cargo: "Entrenador de Arqueros", foto_url: "/banner/3.png", descripcion: "Ex arquero profesional, formador de porteros.", orden: 3 },
  ]);
  console.log(error ? "❌ cuerpo técnico: " + error.message : "✅ 3 miembros del cuerpo técnico insertados");
} else console.log("ℹ️  cuerpo_tecnico ya tiene datos, omitido");

// ── Ajustes ──
const { error: errAj } = await sb.from("ajustes").upsert(
  {
    id: 1,
    hero_titulo: "Formamos deportistas, forjamos personas",
    hero_subtitulo:
      "La Academia de Fútbol Huachipato en Talca entrena a niños y jóvenes con la disciplina y los valores del club. Inscríbete y sé parte de la familia azul.",
    telefono_whatsapp: "+56912345678",
    email_contacto: "contacto@academiahuachipato.cl",
    datos_transferencia:
      "Banco Estado\nCuenta Vista 12345678\nAcademia Huachipato Talca\nRUT 76.543.210-9\ncontacto@academiahuachipato.cl",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    horario_entrenamiento: "Lunes a viernes de 18:00 a 20:00\nSábados de 10:00 a 12:00",
    direccion: "Estadio Fiscal, Av. Circunvalación Oriente, Talca",
  },
  { onConflict: "id" },
);
console.log(errAj ? "❌ ajustes: " + errAj.message : "✅ ajustes rellenados");
