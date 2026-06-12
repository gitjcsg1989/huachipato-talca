import type { Metadata } from "next";
import Image from "next/image";
import { Section, SectionHeader } from "@/components/public/Section";
import { getCuerpoTecnico } from "@/lib/data/contenido";

export const metadata: Metadata = {
  title: "Cuerpo Técnico",
  description:
    "Conoce a los entrenadores y profesionales de la Academia de Fútbol Huachipato Talca.",
};

export default async function CuerpoTecnicoPage() {
  const staff = await getCuerpoTecnico();

  return (
    <Section>
      <SectionHeader
        titulo="Cuerpo técnico"
        descripcion="El equipo profesional detrás de la formación de nuestros jugadores."
      />

      {staff.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-surface-dark p-10 text-center text-white/40">
          Aún no hay información del cuerpo técnico.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface-dark"
            >
              <div className="relative aspect-square bg-white/5">
                {m.fotoUrl ? (
                  <Image
                    src={m.fotoUrl}
                    alt={m.nombre}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-black text-white/10">
                    {m.nombre.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white">{m.nombre}</h3>
                <p className="text-sm text-brand-soft">{m.cargo}</p>
                {m.descripcion && (
                  <p className="mt-2 text-sm text-white/50">{m.descripcion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
