import { z } from "zod";

export const PARENTESCOS = [
  "Madre",
  "Padre",
  "Abuelo/a",
  "Tío/a",
  "Tutor/a",
  "Otro",
] as const;

export const inscripcionSchema = z.object({
  nombre_nino: z.string().min(2, "Ingresa el nombre del niño/a"),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  nombre_apoderado: z.string().min(2, "Ingresa el nombre del apoderado"),
  parentesco_apoderado: z.string().min(1, "Indica el parentesco"),
  telefono: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  categoria_interes: z.string().min(1, "Selecciona una categoría"),
});

export type InscripcionInput = z.infer<typeof inscripcionSchema>;

export const jugadorSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  apellido: z.string().min(2, "Apellido requerido"),
  rut: z.string().optional().or(z.literal("")),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  categoria_id: z.string().uuid("Selecciona una categoría"),
  nombre_apoderado: z.string().min(2, "Nombre del apoderado requerido"),
  parentesco_apoderado: z.string().optional().or(z.literal("")),
  telefono_apoderado: z.string().min(8, "Teléfono inválido"),
  email_apoderado: z.string().email("Email inválido").optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export type JugadorInput = z.infer<typeof jugadorSchema>;

export const pagoMensualidadSchema = z.object({
  monto: z.coerce.number().int().min(0, "Monto inválido"),
  fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  metodo_pago: z.enum(["transferencia", "efectivo"]),
  notas: z.string().optional().or(z.literal("")),
});

export const movimientoSchema = z.object({
  concepto: z.string().min(2, "Concepto requerido"),
  categoria: z.string().min(1, "Categoría requerida"),
  monto: z.coerce.number().int().positive("El monto debe ser positivo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  jugador_id: z.string().uuid().optional().or(z.literal("")),
  proveedor: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

export const usuarioSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  rol: z.enum(["admin", "superadmin"]),
});
