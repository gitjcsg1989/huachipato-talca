import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, SectionHeader } from "@/components/public/Section";
import { GaleriaPublica } from "@/components/public/GaleriaPublica";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";
import { getGaleria } from "@/lib/data/contenido";

export const metadata: Metadata = { title: "Galería" };

export default async function GaleriaPage({
  params,
}: {
  params: Promise<{ escuela: string }>;
}) {
  const { escuela: slug } = await params;
  const escuela = await getEscuelaPorSlug(slug);
  if (!escuela) notFound();

  const fotos = await getGaleria(escuela.id);

  return (
    <Section>
      <SectionHeader
        titulo="Galería"
        descripcion="Momentos de la academia: partidos, entrenamientos y eventos."
      />

      {fotos.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          Aún no hay fotos publicadas.
        </p>
      ) : (
        <GaleriaPublica fotos={fotos} />
      )}
    </Section>
  );
}
