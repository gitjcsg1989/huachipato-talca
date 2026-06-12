-- ════════════════════════════════════════════════════════════════
-- Contenido del sitio gestionado desde el panel (sin Sanity):
-- noticias, galería, productos (tienda) y ajustes del sitio.
-- Ejecutar en Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL DEFAULT 'general',
  imagen_url TEXT,
  extracto TEXT,
  contenido TEXT,
  publicada BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS galeria_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT,
  foto_url TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio INTEGER NOT NULL DEFAULT 0,
  imagen_url TEXT,
  categoria TEXT NOT NULL DEFAULT 'accesorios',
  disponible BOOLEAN NOT NULL DEFAULT true,
  destacado BOOLEAN NOT NULL DEFAULT false,
  nuevo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cuerpo_tecnico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  foto_url TEXT,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ajustes del sitio: fila única (singleton)
CREATE TABLE IF NOT EXISTS ajustes (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_titulo TEXT,
  hero_subtitulo TEXT,
  telefono_whatsapp TEXT,
  email_contacto TEXT,
  datos_transferencia TEXT,
  instagram TEXT,
  facebook TEXT,
  horario_entrenamiento TEXT,
  direccion TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO ajustes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── RLS ──
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuerpo_tecnico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cuerpo_public_read" ON cuerpo_tecnico;
CREATE POLICY "cuerpo_public_read" ON cuerpo_tecnico FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cuerpo_staff_write" ON cuerpo_tecnico;
CREATE POLICY "cuerpo_staff_write" ON cuerpo_tecnico FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

-- Lectura pública
DROP POLICY IF EXISTS "noticias_public_read" ON noticias;
CREATE POLICY "noticias_public_read" ON noticias FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "galeria_public_read" ON galeria_fotos;
CREATE POLICY "galeria_public_read" ON galeria_fotos FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "productos_public_read" ON productos;
CREATE POLICY "productos_public_read" ON productos FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ajustes_public_read" ON ajustes;
CREATE POLICY "ajustes_public_read" ON ajustes FOR SELECT
  TO anon, authenticated USING (true);

-- Escritura solo staff (usa la función creada en schema.sql)
DROP POLICY IF EXISTS "noticias_staff_write" ON noticias;
CREATE POLICY "noticias_staff_write" ON noticias FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());
DROP POLICY IF EXISTS "galeria_staff_write" ON galeria_fotos;
CREATE POLICY "galeria_staff_write" ON galeria_fotos FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());
DROP POLICY IF EXISTS "productos_staff_write" ON productos;
CREATE POLICY "productos_staff_write" ON productos FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());
DROP POLICY IF EXISTS "ajustes_staff_write" ON ajustes;
CREATE POLICY "ajustes_staff_write" ON ajustes FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
