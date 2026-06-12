import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Section } from "@/components/public/Section";
import { InscripcionForm } from "@/components/public/InscripcionForm";
import { getAjustesSitio } from "@/lib/data/contenido";
import { getCategoriasActivas } from "@/lib/data/categorias";

export const metadata: Metadata = {
  title: "Contacto e Inscripciones",
  description:
    "Inscribe a tu hijo/a en la Academia de Fútbol Huachipato Talca o contáctanos.",
};

export default async function ContactoPage() {
  const [ajustes, categorias] = await Promise.all([
    getAjustesSitio(),
    getCategoriasActivas(),
  ]);

  const nombresCategorias = categorias.map((c) => c.nombre);

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        {/* Info de contacto */}
        <div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Contacto e inscripciones
          </h1>
          <p className="mt-3 text-white/60">
            ¿Quieres que tu hijo/a sea parte de la academia? Completa el
            formulario y te contactaremos. También puedes escribirnos
            directamente.
          </p>

          <ul className="mt-8 space-y-5">
            {ajustes?.direccion && (
              <ContactItem icon={<MapPin size={18} />} label="Dirección">
                {ajustes.direccion}
              </ContactItem>
            )}
            {ajustes?.telefonoWhatsapp && (
              <ContactItem icon={<Phone size={18} />} label="Teléfono / WhatsApp">
                {ajustes.telefonoWhatsapp}
              </ContactItem>
            )}
            {ajustes?.emailContacto && (
              <ContactItem icon={<Mail size={18} />} label="Email">
                {ajustes.emailContacto}
              </ContactItem>
            )}
            {ajustes?.horarioEntrenamiento && (
              <ContactItem icon={<Clock size={18} />} label="Horario">
                <span className="whitespace-pre-line">
                  {ajustes.horarioEntrenamiento}
                </span>
              </ContactItem>
            )}
          </ul>
        </div>

        {/* Formulario */}
        <div className="rounded-2xl border border-white/[0.06] bg-surface-dark p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-white">
            Formulario de inscripción
          </h2>
          <InscripcionForm categorias={nombresCategorias} />
        </div>
      </div>
    </Section>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-dim text-brand-soft">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          {label}
        </p>
        <p className="text-sm text-white/80">{children}</p>
      </div>
    </li>
  );
}
