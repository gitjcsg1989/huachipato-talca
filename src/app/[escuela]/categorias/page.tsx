import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, SectionHeader } from "@/components/public/Section";
import { CategoryCard } from "@/components/public/CategoryCard";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";
import { getCategoriasActivas } from "@/lib/data/categorias";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Categorías formativas de la academia.",
};

export default async function CategoriasPage({
  params,
}: {
  params: Promise<{ escuela: string }>;
}) {
  const { escuela: slug } = await params;
  const escuela = await getEscuelaPorSlug(slug);
  if (!escuela) notFound();
  const base = `/${slug}`;

  const categorias = await getCategoriasActivas(escuela.id);

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
              base={base}
              nombre={c.nombre}
              slug={c.slug}
              anioMin={c.anioMin}
              anioMax={c.anioMax}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
