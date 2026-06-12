// Tipos globales del proyecto. Los tipos de tablas viven en src/lib/db/schema.ts
export type {
  Profile,
  Categoria,
  Jugador,
  Inscripcion,
  Mensualidad,
  Ingreso,
  Gasto,
  Rol,
  EstadoInscripcion,
  EstadoMensualidad,
} from "@/lib/db/schema";

/** Envoltura estándar de respuesta de API Routes (regla no negociable #10). */
export type ApiResponse<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fields?: string[] };

export type MetodoPago = "transferencia" | "efectivo";

export const CATEGORIAS_INGRESO = [
  "mensualidad",
  "tienda",
  "donacion",
  "otro",
] as const;
export type CategoriaIngreso = (typeof CATEGORIAS_INGRESO)[number];

export const CATEGORIAS_GASTO = [
  "equipamiento",
  "cancha",
  "admin",
  "otro",
] as const;
export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

/** Jugador con su categoría resuelta (join). */
export type JugadorConCategoria =
  import("@/lib/db/schema").Jugador & {
    categoria: import("@/lib/db/schema").Categoria | null;
  };
