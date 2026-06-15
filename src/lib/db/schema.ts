import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  date,
  timestamp,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Enums ──
export const rolUsuario = pgEnum("rol_usuario", ["superadmin", "admin"]);
export const estadoInscripcion = pgEnum("estado_inscripcion", [
  "pendiente",
  "aprobada",
  "rechazada",
]);
export const estadoMensualidad = pgEnum("estado_mensualidad", [
  "pendiente",
  "pagado",
  "exento",
]);

// ── escuelas ── (tenants)
export const escuelas = pgTable("escuelas", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nombre: text("nombre").notNull(),
  logoUrl: text("logo_url"),
  colorPrimary: text("color_primary").notNull().default("#2952c8"),
  colorPrimarySoft: text("color_primary_soft").notNull().default("#6a8ee0"),
  heroTitulo: text("hero_titulo"),
  heroSubtitulo: text("hero_subtitulo"),
  telefonoWhatsapp: text("telefono_whatsapp"),
  emailContacto: text("email_contacto"),
  datosTransferencia: text("datos_transferencia"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  horarioEntrenamiento: text("horario_entrenamiento"),
  direccion: text("direccion"),
  activa: boolean("activa").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── profiles ── (usuarios internos del panel; id = auth.users.id)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  rol: rolUsuario("rol").notNull().default("admin"),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── categorias ──
export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  anioMin: integer("anio_min").notNull(),
  anioMax: integer("anio_max").notNull(),
  activa: boolean("activa").notNull().default(true),
});

// ── jugadores ──
export const jugadores = pgTable("jugadores", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  rut: text("rut").unique(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  categoriaId: uuid("categoria_id")
    .notNull()
    .references(() => categorias.id),
  nombreApoderado: text("nombre_apoderado").notNull(),
  parentescoApoderado: text("parentesco_apoderado"),
  telefonoApoderado: text("telefono_apoderado").notNull(),
  emailApoderado: text("email_apoderado"),
  activo: boolean("activo").notNull().default(true),
  fechaIngreso: date("fecha_ingreso")
    .notNull()
    .default(sql`CURRENT_DATE`),
  notas: text("notas"),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── inscripciones ── (solicitudes del formulario público)
export const inscripciones = pgTable("inscripciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombreNino: text("nombre_nino").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  nombreApoderado: text("nombre_apoderado").notNull(),
  parentescoApoderado: text("parentesco_apoderado"),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  categoriaInteres: text("categoria_interes").notNull(),
  estado: estadoInscripcion("estado").notNull().default("pendiente"),
  notasAdmin: text("notas_admin"),
  jugadorId: uuid("jugador_id").references(() => jugadores.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── mensualidades ──
export const mensualidades = pgTable(
  "mensualidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    escuelaId: uuid("escuela_id").references(() => escuelas.id),
    jugadorId: uuid("jugador_id")
      .notNull()
      .references(() => jugadores.id, { onDelete: "cascade" }),
    mes: integer("mes").notNull(),
    anio: integer("anio").notNull(),
    monto: integer("monto").notNull().default(0),
    estado: estadoMensualidad("estado").notNull().default("pendiente"),
    fechaPago: date("fecha_pago"),
    metodoPago: text("metodo_pago"),
    notas: text("notas"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("mensualidad_unica").on(t.jugadorId, t.mes, t.anio),
    check("mes_valido", sql`${t.mes} BETWEEN 1 AND 12`),
  ],
);

// ── ingresos ──
export const ingresos = pgTable("ingresos", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  concepto: text("concepto").notNull(),
  categoria: text("categoria").notNull(),
  monto: integer("monto").notNull(),
  fecha: date("fecha").notNull(),
  jugadorId: uuid("jugador_id").references(() => jugadores.id),
  notas: text("notas"),
  registradoPor: uuid("registrado_por")
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── gastos ──
export const gastos = pgTable("gastos", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  concepto: text("concepto").notNull(),
  categoria: text("categoria").notNull(),
  monto: integer("monto").notNull(),
  fecha: date("fecha").notNull(),
  proveedor: text("proveedor"),
  notas: text("notas"),
  registradoPor: uuid("registrado_por")
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Contenido del sitio (gestionado desde el panel) ──
export const noticias = pgTable("noticias", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  titulo: text("titulo").notNull(),
  slug: text("slug").notNull().unique(),
  fecha: date("fecha").notNull().default(sql`CURRENT_DATE`),
  categoria: text("categoria").notNull().default("general"),
  imagenUrl: text("imagen_url"),
  extracto: text("extracto"),
  contenido: text("contenido"),
  publicada: boolean("publicada").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const galeriaFotos = pgTable("galeria_fotos", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  titulo: text("titulo"),
  fotoUrl: text("foto_url").notNull(),
  fecha: date("fecha").notNull().default(sql`CURRENT_DATE`),
  orden: integer("orden").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productos = pgTable("productos", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  precio: integer("precio").notNull().default(0),
  imagenUrl: text("imagen_url"),
  categoria: text("categoria").notNull().default("accesorios"),
  disponible: boolean("disponible").notNull().default(true),
  destacado: boolean("destacado").notNull().default(false),
  nuevo: boolean("nuevo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cuerpoTecnico = pgTable("cuerpo_tecnico", {
  id: uuid("id").primaryKey().defaultRandom(),
  escuelaId: uuid("escuela_id").references(() => escuelas.id),
  nombre: text("nombre").notNull(),
  cargo: text("cargo").notNull(),
  fotoUrl: text("foto_url"),
  descripcion: text("descripcion"),
  orden: integer("orden").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ajustes = pgTable("ajustes", {
  id: integer("id").primaryKey().default(1),
  heroTitulo: text("hero_titulo"),
  heroSubtitulo: text("hero_subtitulo"),
  telefonoWhatsapp: text("telefono_whatsapp"),
  emailContacto: text("email_contacto"),
  datosTransferencia: text("datos_transferencia"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  horarioEntrenamiento: text("horario_entrenamiento"),
  direccion: text("direccion"),
});

// ── Tipos inferidos ──
export type Profile = typeof profiles.$inferSelect;
export type NuevoProfile = typeof profiles.$inferInsert;
export type Categoria = typeof categorias.$inferSelect;
export type NuevaCategoria = typeof categorias.$inferInsert;
export type Jugador = typeof jugadores.$inferSelect;
export type NuevoJugador = typeof jugadores.$inferInsert;
export type Inscripcion = typeof inscripciones.$inferSelect;
export type NuevaInscripcion = typeof inscripciones.$inferInsert;
export type Mensualidad = typeof mensualidades.$inferSelect;
export type NuevaMensualidad = typeof mensualidades.$inferInsert;
export type Ingreso = typeof ingresos.$inferSelect;
export type NuevoIngreso = typeof ingresos.$inferInsert;
export type Gasto = typeof gastos.$inferSelect;
export type NuevoGasto = typeof gastos.$inferInsert;
export type Noticia = typeof noticias.$inferSelect;
export type Producto = typeof productos.$inferSelect;
export type GaleriaFoto = typeof galeriaFotos.$inferSelect;
export type Ajustes = typeof ajustes.$inferSelect;
export type MiembroTecnico = typeof cuerpoTecnico.$inferSelect;
export type Escuela = typeof escuelas.$inferSelect;
export type NuevaEscuela = typeof escuelas.$inferInsert;

export type Rol = (typeof rolUsuario.enumValues)[number];
export type EstadoInscripcion = (typeof estadoInscripcion.enumValues)[number];
export type EstadoMensualidad = (typeof estadoMensualidad.enumValues)[number];
