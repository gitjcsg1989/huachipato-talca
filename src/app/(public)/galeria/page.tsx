import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/public/Section";
import { GaleriaPublica } from "@/components/public/GaleriaPublica";
import { getGaleria } from "@/lib/data/contenido";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Fotos de partidos, entrenamientos y actividades de la Academia Huachipato Talca.",
};

export default async function GaleriaPage() {
  const fotos = await getGaleria();

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
