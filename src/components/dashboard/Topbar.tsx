"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/jugadores", label: "Jugadores", icon: Users },
  { href: "/dashboard/inscripciones", label: "Inscripciones", icon: ClipboardList },
  { href: "/dashboard/mensualidades", label: "Mensualidades", icon: CalendarDays },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/dashboard/noticias", label: "Noticias", icon: Newspaper },
  { href: "/dashboard/galeria", label: "Galería", icon: Images },
  { href: "/dashboard/tienda", label: "Tienda", icon: ShoppingBag },
  { href: "/dashboard/cuerpo-tecnico", label: "Cuerpo técnico", icon: UserCog },
  { href: "/dashboard/ajustes", label: "Ajustes", icon: SlidersHorizontal },
];

export function Topbar({
  titulo,
  esSuperadmin,
}: {
  titulo: string;
  esSuperadmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activo = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/[0.06] bg-white px-4 lg:px-8">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="text-gray-600 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-nav p-0 text-white">
          <SheetTitle className="px-5 pt-5 text-white">Menú</SheetTitle>
          <nav className="space-y-1 p-3">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    activo(l.href, l.exact)
                      ? "bg-brand text-white"
                      : "text-white/60",
                  )}
                >
                  <Icon size={18} />
                  {l.label}
                </Link>
              );
            })}
            {esSuperadmin && (
              <Link
                href="/dashboard/usuarios"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  activo("/dashboard/usuarios")
                    ? "bg-brand text-white"
                    : "text-white/60",
                )}
              >
                <Settings size={18} />
                Usuarios
              </Link>
            )}
            <form action={logoutAction} className="pt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </form>
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-bold text-gray-900">{titulo}</h1>
    </header>
  );
}
