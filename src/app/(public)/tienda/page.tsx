import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/public/Section";
import { TiendaGrid } from "@/components/public/TiendaGrid";
import { getProductosDisponibles, getAjustesSitio } from "@/lib/data/contenido";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Indumentaria y accesorios oficiales de la Academia de Fútbol Huachipato Talca.",
};

export default async function TiendaPage() {
  const [productos, ajustes] = await Promise.all([
    getProductosDisponibles(),
    getAjustesSitio(),
  ]);

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
          datosTransferencia={ajustes?.datosTransferencia}
          telefonoWhatsapp={ajustes?.telefonoWhatsapp}
        />
      )}
    </Section>
  );
}
