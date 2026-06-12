import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/public/Section";
import { NewsCard } from "@/components/public/NewsCard";
import { getNoticias } from "@/lib/data/contenido";

export const metadata: Metadata = {
  title: "Noticias",
  description:
    "Noticias, resultados y comunicados de la Academia de Fútbol Huachipato Talca.",
};

const POR_PAGINA = 9;

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const p = Math.max(1, Number(pagina) || 1);

  const { noticias, total } = await getNoticias({
    pagina: p,
    porPagina: POR_PAGINA,
    soloPublicadas: true,
  });
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <Section>
      <SectionHeader
        titulo="Noticias"
        descripcion="Todo lo que pasa en la academia: resultados, eventos y comunicados."
      />

      {noticias.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          Aún no hay noticias publicadas.
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <NewsCard key={n.id} noticia={n} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={n === 1 ? "/noticias" : `/noticias?pagina=${n}`}
                  className={
                    n === p
                      ? "rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white"
                  }
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}
