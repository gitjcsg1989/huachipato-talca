import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { Section, SectionHeader } from "@/components/public/Section";
import { NewsCard } from "@/components/public/NewsCard";
import { CategoryCard } from "@/components/public/CategoryCard";
import { ProductCard } from "@/components/public/ProductCard";
import {
  getNoticiasRecientes,
  getProductosDestacados,
  getAjustesSitio,
} from "@/lib/data/contenido";
import { getCategoriasActivas } from "@/lib/data/categorias";

const STATS = [
  { valor: "+150", label: "Jugadores" },
  { valor: "8", label: "Categorías" },
  { valor: "12", label: "Entrenadores" },
  { valor: "2019", label: "Fundación" },
];

export default async function HomePage() {
  const [noticias, categorias, productos, ajustes] = await Promise.all([
    getNoticiasRecientes(3),
    getCategoriasActivas(),
    getProductosDestacados(4),
    getAjustesSitio(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Academia de Fútbol Huachipato — Filial Talca",
    sport: "Fútbol",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://escuelahuachipato.cl",
    parentOrganization: { "@type": "SportsTeam", name: "Club Deportivo Huachipato" },
    address: ajustes?.direccion
      ? { "@type": "PostalAddress", addressLocality: "Talca", addressCountry: "CL", streetAddress: ajustes.direccion }
      : { "@type": "PostalAddress", addressLocality: "Talca", addressCountry: "CL" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroCarousel
        titulo={
          ajustes?.heroTitulo ?? "Formamos deportistas, forjamos personas"
        }
        subtitulo={
          ajustes?.heroSubtitulo ??
          "La Academia de Fútbol Huachipato en Talca entrena a niños y jóvenes con la disciplina y los valores del club. Inscríbete y sé parte de la familia azul."
        }
      />

      {/* Stats */}
      <div className="border-b border-white/[0.06] bg-nav">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-px px-5 py-2 sm:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-6 text-center">
              <div className="text-3xl font-black text-brand-soft">
                {s.valor}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/40">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Noticias */}
      {noticias.length > 0 && (
        <Section>
          <SectionHeader
            titulo="Últimas noticias"
            descripcion="Resultados, eventos y comunicados de la academia."
            verMas={{ href: "/noticias", label: "Ver todas" }}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {noticias.map((n) => (
              <NewsCard key={n.id} noticia={n} />
            ))}
          </div>
        </Section>
      )}

      {/* Categorías */}
      {categorias.length > 0 && (
        <Section className="pt-0">
          <SectionHeader
            titulo="Nuestras categorías"
            descripcion="Desde los más pequeños hasta las series superiores."
            verMas={{ href: "/categorias", label: "Ver todas" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.slice(0, 4).map((c) => (
              <CategoryCard
                key={c.id}
                nombre={c.nombre}
                slug={c.slug}
                anioMin={c.anioMin}
                anioMax={c.anioMax}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Tienda */}
      {productos.length > 0 && (
        <Section className="pt-0">
          <SectionHeader
            titulo="Tienda oficial"
            descripcion="Indumentaria y accesorios de la academia."
            verMas={{ href: "/tienda", label: "Ver tienda" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                datosTransferencia={ajustes?.datosTransferencia}
                telefonoWhatsapp={ajustes?.telefonoWhatsapp}
              />
            ))}
          </div>
        </Section>
      )}

      {/* CTA inscripción */}
      <Section>
        <div className="relative overflow-hidden rounded-2xl border border-border-blue bg-brand px-8 py-12 text-center lg:py-16">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-black text-white sm:text-4xl">
            ¿Listo para jugar con nosotros?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">
            Completa el formulario de inscripción y nuestro equipo te contactará
            para sumarte a la categoría que corresponde.
          </p>
          <Link
            href="/contacto"
            className="relative mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand transition-transform hover:scale-[1.02]"
          >
            Inscribirse ahora
            <ArrowRight size={18} />
          </Link>
        </div>
      </Section>
    </>
  );
}
