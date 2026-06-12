import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte recursivamente las claves snake_case → camelCase.
 * El cliente de Supabase devuelve columnas en snake_case; nuestros tipos
 * (Drizzle) usan camelCase. Aplicar en la capa de datos.
 */
export function toCamel<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((v) => toCamel(v)) as T;
  }
  if (input !== null && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const camel = k.replace(/_([a-z0-9])/g, (_, c: string) =>
        c.toUpperCase(),
      );
      out[camel] = toCamel(v);
    }
    return out as T;
  }
  return input as T;
}

/** Formatea un entero CLP como "$18.990". Nunca usar floats para dinero. */
export function formatCLP(monto: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(monto);
}

/** Formatea una fecha ISO/Date a "14 mar 2025". */
export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function nombreMes(mes: number): string {
  return MESES[mes - 1] ?? "";
}

export { MESES };

/** Calcula la edad a partir de la fecha de nacimiento. */
export function calcularEdad(fechaNacimiento: string | Date): number {
  const nac =
    typeof fechaNacimiento === "string"
      ? new Date(fechaNacimiento)
      : fechaNacimiento;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Genera un link de WhatsApp con mensaje pre-armado. */
export function whatsappLink(telefono: string, mensaje?: string): string {
  const num = telefono.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${num}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Slugify simple para strings en español. */
export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
