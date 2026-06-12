import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { InstagramIcon, FacebookIcon } from "./SocialIcons";
import { NAV_PUBLICO } from "@/lib/navegacion";
import { getAjustesSitio } from "@/lib/data/contenido";
import { whatsappLink } from "@/lib/utils";

export async function Footer() {
  const ajustes = await getAjustesSitio();
  const anio = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-nav">
      <div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Formación deportiva y valores para niños y jóvenes de Talca, bajo
              la marca del Club Deportivo Huachipato.
            </p>
            <div className="mt-5 flex gap-3">
              {ajustes?.instagram && (
                <a
                  href={ajustes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white"
                >
                  <InstagramIcon size={18} />
                </a>
              )}
              {ajustes?.facebook && (
                <a
                  href={ajustes.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white"
                >
                  <FacebookIcon size={18} />
                </a>
              )}
              {ajustes?.telefonoWhatsapp && (
                <a
                  href={whatsappLink(ajustes.telefonoWhatsapp)}
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
                    href={item.href}
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
              {ajustes?.direccion && <li>{ajustes.direccion}</li>}
              {ajustes?.telefonoWhatsapp && <li>{ajustes.telefonoWhatsapp}</li>}
              {ajustes?.emailContacto && <li>{ajustes.emailContacto}</li>}
              <li>
                <Link href="/login" className="text-white/40 hover:text-white">
                  Acceso al panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-white/30">
          © {anio} Academia de Fútbol Huachipato — Filial Talca. Todos los
          derechos reservados.
        </div>
      </div>
    </footer>
  );
}
