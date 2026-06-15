"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  Wallet,
  Settings,
  LogOut,
  Newspaper,
  Images,
  ShoppingBag,
  SlidersHorizontal,
  UserCog,
  Building2,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/public/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/jugadores", label: "Jugadores", icon: Users },
  {
    href: "/dashboard/inscripciones",
    label: "Inscripciones",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/mensualidades",
    label: "Mensualidades",
    icon: CalendarDays,
  },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: Wallet },
];

const LINKS_SITIO = [
  { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
  { href: "/dashboard/galeria", label: "Galería", icon: Images },
  { href: "/dashboard/tienda", label: "Tienda", icon: ShoppingBag },
  { href: "/dashboard/cuerpo-tecnico", label: "Cuerpo técnico", icon: UserCog },
  { href: "/dashboard/ajustes", label: "Ajustes", icon: SlidersHorizontal },
];

export function Sidebar({
  nombre,
  rol,
  esSuperadmin,
  inscripcionesPendientes,
  escuelaNombre,
}: {
  nombre: string;
  rol: string;
  esSuperadmin: boolean;
  inscripcionesPendientes: number;
  escuelaNombre: string;
}) {
  const pathname = usePathname();
  const activo = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-nav text-white lg:flex">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <Logo size={28} />
        <p className="mt-2 truncate text-[11px] font-medium text-white/40">
          {escuelaNombre}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const esInscripciones = l.href === "/dashboard/inscripciones";
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activo(l.href, l.exact)
                  ? "bg-brand text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{l.label}</span>
              {esInscripciones && inscripcionesPendientes > 0 && (
                <span className="rounded-full bg-bad px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {inscripcionesPendientes}
                </span>
              )}
            </Link>
          );
        })}

        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-white/30">
          Sitio web
        </p>
        {LINKS_SITIO.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activo(l.href)
                  ? "bg-brand text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={18} />
              {l.label}
            </Link>
          );
        })}

        {esSuperadmin && (
          <>
            <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Plataforma
            </p>
            <Link
              href="/dashboard/escuelas"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activo("/dashboard/escuelas")
                  ? "bg-brand text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Building2 size={18} />
              Escuelas
            </Link>
            <Link
              href="/dashboard/usuarios"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activo("/dashboard/usuarios")
                  ? "bg-brand text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Settings size={18} />
              Usuarios
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-semibold">{nombre}</p>
          <p className="text-xs capitalize text-white/40">{rol}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
