import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { InstagramIcon, FacebookIcon } from "./SocialIcons";
import { NAV_PUBLICO } from "@/lib/navegacion";
import { whatsappLink } from "@/lib/utils";
import type { Escuela } from "@/lib/db/schema";

export function Footer({ escuela }: { escuela: Escuela }) {
  const anio = new Date().getFullYear();
  const base = `/${escuela.slug}`;
  const hrefDe = (h: string) => (h === "/" ? base : `${base}${h}`);

  return (
    <footer className="border-t border-white/[0.06] bg-nav">
      <div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo nombre={escuela.nombre} logoUrl={escuela.logoUrl} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Formación deportiva y valores para niños y jóvenes.
            </p>
            <div className="mt-5 flex gap-3">
              {escuela.instagram && (
                <a
                  href={escuela.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white"
                >
                  <InstagramIcon size={18} />
                </a>
              )}
              {escuela.facebook && (
                <a
                  href={escuela.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white"
                >
                  <FacebookIcon size={18} />
                </a>
              )}
              {escuela.telefonoWhatsapp && (
                <a
                  href={whatsappLink(escuela.telefonoWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white"
                >
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {NAV_PUBLICO.map((item) => (
                <li key={item.href}>
                  <Link
                    href={hrefDe(item.href)}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Contacto
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              {escuela.direccion && <li>{escuela.direccion}</li>}
              {escuela.telefonoWhatsapp && <li>{escuela.telefonoWhatsapp}</li>}
              {escuela.emailContacto && <li>{escuela.emailContacto}</li>}
              <li>
                <Link href="/login" className="text-white/40 hover:text-white">
                  Acceso al panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-white/30">
          © {anio} {escuela.nombre}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
