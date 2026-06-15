import type { MetadataRoute } from "next";
import { getEscuelas } from "@/lib/data/escuelas";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huachipato-talca.vercel.app";
  const sub = ["", "/noticias", "/categorias", "/cuerpo-tecnico", "/galeria", "/tienda", "/contacto"];
  const escuelas = await getEscuelas();

  const urls: MetadataRoute.Sitemap = [];
  for (const e of escuelas) {
    for (const r of sub) {
      urls.push({
        url: `${base}/${e.slug}${r}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: r === "" ? 0.9 : 0.6,
      });
    }
  }
  return urls;
}
