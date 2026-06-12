import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/public/Section";
import { CategoryCard } from "@/components/public/CategoryCard";
import { getCategoriasActivas } from "@/lib/data/categorias";
import { getCategoriasPublicas } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Categorías",
  description:
    "Categorías formativas de la Academia de Fútbol Huachipato Talca, desde Sub-6 hasta las series superiores.",
};

export default async function CategoriasPage() {
  const [categorias, contenido] = await Promise.all([
    getCategoriasActivas(),
    getCategoriasPublicas(),
  ]);
  const descPorSlug = new Map(
    contenido.map((c) => [c.slug, c.descripcion]),
  );

  return (
    <Section>
      <SectionHeader
        titulo="Categorías"
        descripcion="Cada categoría agrupa a los jugadores según su año de nacimiento."
      />

      {categorias.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          Las categorías aún no están configuradas.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => (
            <CategoryCard
              key={c.id}
              nombre={c.nombre}
              slug={c.slug}
              anioMin={c.anioMin}
              anioMax={c.anioMax}
              descripcion={descPorSlug.get(c.slug) ?? undefined}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
