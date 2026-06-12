# Escuela de Fútbol Huachipato — Filial Talca

Sitio web institucional + panel de gestión interna para la Escuela de Fútbol
Huachipato, filial Talca.

- **Público:** inicio, noticias, categorías, cuerpo técnico, galería, tienda e
  inscripciones.
- **Privado (`/dashboard`):** jugadores, inscripciones, mensualidades, finanzas
  y gestión de usuarios.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Supabase (Auth + Postgres) · Drizzle ORM · Sanity v3 · Resend · Recharts.

---

## Requisitos

- Node.js 20+
- pnpm 9+
- Cuentas en: [Supabase](https://supabase.com), [Sanity](https://sanity.io),
  [Resend](https://resend.com) y [Vercel](https://vercel.com) (deploy).

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # completar con las claves reales
pnpm dev                     # http://localhost:3000
```

La app **compila y corre sin credenciales** (las páginas con datos aparecen
vacías). Para funcionalidad completa, configura los servicios:

### 1. Supabase
1. Crea un proyecto en supabase.com.
2. SQL Editor → pega y ejecuta `supabase/schema.sql` (tablas + RLS + categorías seed).
3. Authentication → habilita Email/Password y **desactiva** "Confirm email"
   (los usuarios son internos, no hay registro público).
4. Settings → API: copia `URL`, `anon key` y `service_role key` a `.env.local`.
5. Settings → Database → Connection string (URI): cópiala a `DATABASE_URL`.
6. Crea el primer usuario en Authentication → Users, y luego inserta su perfil:
   ```sql
   insert into profiles (id, nombre, email, rol)
   values ('<uuid-del-usuario>', 'Tu Nombre', 'tu@email.cl', 'superadmin');
   ```

### 2. Sanity
1. Crea un proyecto en sanity.io/manage y copia `projectId` a `.env.local`.
2. El Studio está embebido en `/studio` — entra ahí para cargar contenido
   (noticias, categorías públicas, cuerpo técnico, productos, ajustes del sitio).
3. Genera un token de escritura (API → Tokens) y un webhook secret.
4. Configura el webhook (API → Webhooks) apuntando a
   `https://<tu-dominio>/api/webhooks/sanity` con el secret, para revalidar ISR.

### 3. Resend
1. Crea una API key y verifica tu dominio remitente.
2. Completa `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `ADMIN_NOTIFICATION_EMAIL`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript sin emitir |
| `pnpm db:push` | Aplica el schema Drizzle (sin RLS — preferir `schema.sql`) |

## Deploy en Vercel
1. Sube el repo a GitHub y conéctalo en vercel.com/new.
2. Agrega todas las variables de `.env.example` en Project → Settings → Env.
3. El build corre TypeScript + ESLint; si fallan, el deploy no pasa.

Más detalle de arquitectura y convenciones en [`CLAUDE.md`](./CLAUDE.md).
