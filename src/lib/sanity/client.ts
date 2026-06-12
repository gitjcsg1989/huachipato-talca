import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "../../../sanity/env";

// Si no hay projectId aún (build sin credenciales), usar un placeholder válido
// para no romper la evaluación del módulo. Las queries están protegidas por
// `sanityConfigurado`, así que nunca se ejecuta una consulta real sin config.
export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true, // datos públicos cacheados
  perspective: "published",
});

const builder = createImageUrlBuilder(sanityClient);

/** Construye una URL de imagen optimizada desde una referencia de Sanity. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Resuelve la URL de una imagen ya sea demo (campo `url` directo) o de Sanity
 * (campo `asset`). Devuelve null si no hay imagen.
 */
export function imgUrl(
  source: unknown,
  opts: { width?: number; height?: number } = {},
): string | null {
  if (!source || typeof source !== "object") return null;
  const s = source as { url?: string; asset?: unknown };
  if (s.url) return s.url; // imagen demo (URL local directa)
  if (!s.asset) return null;
  let b = urlFor(source as SanityImageSource);
  if (opts.width) b = b.width(opts.width);
  if (opts.height) b = b.height(opts.height).fit("crop");
  return b.url();
}

/** ¿Está Sanity configurado? Evita llamadas vacías en build sin credenciales. */
export const sanityConfigurado = Boolean(projectId);
