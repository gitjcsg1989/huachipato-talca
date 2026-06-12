import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://escuelahuachipato.cl";
  const rutas = [
    "",
    "/noticias",
    "/categorias",
    "/cuerpo-tecnico",
    "/galeria",
    "/tienda",
    "/contacto",
  ];
  return rutas.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
