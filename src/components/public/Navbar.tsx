"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_PUBLICO } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

export function Navbar({
  slug,
  nombre,
  logoUrl,
}: {
  slug: string;
  nombre: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const base = `/${slug}`;
  const hrefDe = (h: string) => (h === "/" ? base : `${base}${h}`);
  const esActivo = (h: string) =>
    h === "/" ? pathname === base : pathname.startsWith(`${base}${h}`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-nav/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 lg:px-8">
        <Link href={base} aria-label="Inicio">
          <Logo nombre={nombre} logoUrl={logoUrl} />
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_PUBLICO.map((item) => (
            <li key={item.href}>
              <Link
                href={hrefDe(item.href)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  esActivo(item.href)
                    ? "text-white"
                    : "text-white/50 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link
            href={`${base}/contacto`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
          >
            Inscribirse
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="text-white lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          {abierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-white/[0.06] bg-nav lg:hidden">
          <ul className="space-y-1 px-5 py-4">
            {NAV_PUBLICO.map((item) => (
              <li key={item.href}>
                <Link
                  href={hrefDe(item.href)}
                  onClick={() => setAbierto(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium",
                    esActivo(item.href)
                      ? "bg-white/5 text-white"
                      : "text-white/60",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={`${base}/contacto`}
                onClick={() => setAbierto(false)}
                className="block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Inscribirse
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
