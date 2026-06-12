# Escuela de Fútbol Huachipato — Filial Talca

Sitio web institucional con panel de gestión interna. Doble capa:
sitio público (noticias, categorías, tienda, inscripciones) + dashboard
privado (jugadores, mensualidades, finanzas).

## Comandos

- `pnpm dev` — Servidor de desarrollo en localhost:3000
- `pnpm build` — Build de producción
- `pnpm start` — Servir build de producción
- `pnpm lint` — ESLint
- `pnpm type-check` — TypeScript sin emitir
- `pnpm db:push` — Aplicar schema Drizzle a Postgres (requiere DATABASE_URL)
- `pnpm db:generate` — Generar migraciones desde el schema
- `pnpm db:studio` — Drizzle Studio

> Nota: el camino recomendado para crear las tablas es ejecutar
> `supabase/schema.sql` en el SQL Editor de Supabase (incluye RLS y seed).
> `db:push` es alternativo y NO crea las políticas RLS.

## Tech Stack

Next.js 16 (App Router, Turbopack) + TypeScript strict + Tailwind CSS v4 +
shadcn/ui (basado en Base UI) + Supabase (Auth + Postgres) + Drizzle ORM +
Sanity Studio v3 (embebido en `/studio`) + Resend + Recharts + Vercel.

## Arquitectura

### Grupos de rutas
- `(public)/` — Sitio público con Navbar dark + Footer (tema oscuro)
- `(auth)/` — Login sin chrome extra
- `dashboard/` — Panel interno con Sidebar + Topbar (tema claro)
- `studio/[[...tool]]` — Sanity Studio embebido
- `api/` — Route Handlers (inscripciones públicas, webhook de Sanity)

### Data flow
- Páginas públicas: Server Components → Sanity (ISR, fetch con `tags`) o
  Supabase vía `createPublicClient()` (anon, sin cookies → permite ISR)
- Dashboard: Server Components → `createClient()` (server, con cookies/sesión)
- Mutaciones: Server Actions en `src/lib/actions/*` con validación Zod
- Formulario público de inscripción → `POST /api/inscripciones` → Supabase + Resend

### Capas de datos (`src/lib`)
- `supabase/client.ts` — browser client (Client Components)
- `supabase/server.ts` — `createClient()` (sesión), `createPublicClient()` (anon),
  `createAdminClient()` (service role, bypassa RLS), `getUser()`, `getProfile()`
- `supabase/middleware.ts` — refresco de sesión + protección de `/dashboard`
- `db/schema.ts` — schema Drizzle (fuente de tipos: `Jugador`, `Mensualidad`, …)
- `data/*` — lecturas tipadas por dominio
- `actions/*` — Server Actions (escrituras), cada una verifica rol con `checkRole`
- `auth/guards.ts` — `requireProfile()`, `requireRole()`, `checkRole()`
- `sanity/` — cliente, queries GROQ tipadas y fetch seguro (`sanityConfigurado`)

### Patrones clave
- Server Components por defecto. `"use client"` SOLO para interactividad.
- `src/lib/supabase/server.ts` para SSR; `client.ts` solo en Client Components.
- `src/middleware.ts` protege `/dashboard/*` y refresca sesión.
- Rol del usuario leído de `profiles.rol` (no del JWT). Verificar en CADA
  Server Action sensible con `checkRole('admin'|'superadmin')`.
- Todos los montos en CLP entero (INTEGER en DB, sin decimales).
  Formatear con `formatCLP()` de `src/lib/utils.ts`.
- shadcn aquí usa **Base UI**, no Radix: los triggers usan la prop `render`
  o se estilan directamente — NO existe `asChild`.
- `lucide-react` v1 removió iconos de marca; Instagram/Facebook están en
  `src/components/public/SocialIcons.tsx`.

## Sistema de Diseño

Paleta de marca expuesta como tokens Tailwind v4 en `globals.css`
(`bg-brand`, `text-brand-soft`, `bg-ink`, `bg-surface-dark`, `bg-nav`,
`text-ok/warn/bad`, `bg-dash-bg`).

### Sitio público (tema oscuro)
- Fondo `#09090f` (`bg-ink`), Surface `#111120`, Nav `#0c0c14`
- Primary `#2952c8` (`brand`), Primary-soft `#6a8ee0` (`brand-soft`)

### Dashboard (tema claro)
- Fondo `#f4f6f9` (`bg-dash-bg`), cards blancas, texto gris oscuro

### Tipografía
- Inter (Google Fonts) — headings 800–900, body 400. Mono: JetBrains Mono.

## Variables de Entorno

Ver `.env.example`. Sin Supabase/Sanity configurados, la app compila y corre,
pero las páginas con datos aparecen vacías y las inscripciones devuelven 503.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadata, sitemap, OG) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (solo servidor) |
| `DATABASE_URL` | Postgres connection string (Drizzle) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID proyecto Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset Sanity (production) |
| `SANITY_API_TOKEN` | Token escritura Sanity |
| `SANITY_WEBHOOK_SECRET` | Secret para webhook ISR |
| `RESEND_API_KEY` | API key Resend |
| `RESEND_FROM_EMAIL` | Email remitente |
| `ADMIN_NOTIFICATION_EMAIL` | Email del admin |

## Reglas No Negociables

1. TypeScript strict. Cero `any`. Tipar todo.
2. Verificar rol en CADA Server Action y API Route sensible — no confiar solo
   en el middleware.
3. Montos como INTEGER en CLP. Nunca floats para dinero.
4. Mobile-first. Revisar en 375px antes de dar una UI por terminada.
5. Usar `<Image>` de Next.js, nunca `<img>`.
6. ISR para contenido de Sanity: fetch con `tags` + webhook (`revalidateTag`).
7. RLS habilitado en todas las tablas. Nunca deshabilitarlo "para simplificar".
8. Un componente por archivo, máx ~300 líneas. Extraer si se supera.
