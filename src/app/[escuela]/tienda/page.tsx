import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, SectionHeader } from "@/components/public/Section";
import { TiendaGrid } from "@/components/public/TiendaGrid";
import { getEscuelaPorSlug } from "@/lib/data/escuelas";
import { getProductosDisponibles } from "@/lib/data/contenido";

export const metadata: Metadata = { title: "Tienda" };

export default async function TiendaPage({
  params,
}: {
  params: Promise<{ escuela: string }>;
}) {
  const { escuela: slug } = await params;
  const escuela = await getEscuelaPorSlug(slug);
  if (!escuela) notFound();

  const productos = await getProductosDisponibles(escuela.id);

  return (
    <Section>
      <SectionHeader
        titulo="Tienda oficial"
        descripcion="Compra manual por WhatsApp o transferencia. Sin carrito ni pago online."
      />

      {productos.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          Aún no hay productos disponibles.
        </p>
      ) : (
        <TiendaGrid
          productos={productos}
          datosTransferencia={escuela.datosTransferencia}
          telefonoWhatsapp={escuela.telefonoWhatsapp}
        />
      )}
    </Section>
  );
}
