-- ════════════════════════════════════════════════════════════════
-- Escuela de Fútbol Huachipato — Filial Talca
-- Schema completo + RLS. Ejecutar en Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- ── Enums ──
DO $$ BEGIN
  CREATE TYPE rol_usuario AS ENUM ('superadmin', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_inscripcion AS ENUM ('pendiente', 'aprobada', 'rechazada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_mensualidad AS ENUM ('pendiente', 'pagado', 'exento');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── Tablas ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  anio_min INTEGER NOT NULL,
  anio_max INTEGER NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS jugadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rut TEXT UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  nombre_apoderado TEXT NOT NULL,
  parentesco_apoderado TEXT,
  telefono_apoderado TEXT NOT NULL,
  email_apoderado TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Si la tabla ya existía, agregar columnas nuevas:
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS parentesco_apoderado TEXT;

CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_nino TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  nombre_apoderado TEXT NOT NULL,
  parentesco_apoderado TEXT,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  categoria_interes TEXT NOT NULL,
  estado estado_inscripcion NOT NULL DEFAULT 'pendiente',
  notas_admin TEXT,
  jugador_id UUID REFERENCES jugadores(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS parentesco_apoderado TEXT;

CREATE TABLE IF NOT EXISTS mensualidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio INTEGER NOT NULL,
  monto INTEGER NOT NULL DEFAULT 0,
  estado estado_mensualidad NOT NULL DEFAULT 'pendiente',
  fecha_pago DATE,
  metodo_pago TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(jugador_id, mes, anio)
);

CREATE TABLE IF NOT EXISTS ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto INTEGER NOT NULL,
  fecha DATE NOT NULL,
  jugador_id UUID REFERENCES jugadores(id),
  notas TEXT,
  registrado_por UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto INTEGER NOT NULL,
  fecha DATE NOT NULL,
  proveedor TEXT,
  notas TEXT,
  registrado_por UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
-- Helper: ¿el usuario autenticado es un perfil interno activo?
-- SECURITY DEFINER evita recursión en las policies de profiles.
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.es_staff_activo()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND activo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.es_superadmin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND activo = true AND rol = 'superadmin'
  );
$$;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensualidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- profiles: cada quien ve su perfil; superadmin gestiona todos
DROP POLICY IF EXISTS "profiles_self_select" ON profiles;
CREATE POLICY "profiles_self_select" ON profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR public.es_superadmin());

DROP POLICY IF EXISTS "profiles_superadmin_all" ON profiles;
CREATE POLICY "profiles_superadmin_all" ON profiles FOR ALL
  TO authenticated USING (public.es_superadmin()) WITH CHECK (public.es_superadmin());

-- categorias: lectura pública (sitio), escritura solo staff
DROP POLICY IF EXISTS "categorias_public_read" ON categorias;
CREATE POLICY "categorias_public_read" ON categorias FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categorias_staff_write" ON categorias;
CREATE POLICY "categorias_staff_write" ON categorias FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

-- jugadores: lectura pública limitada (plantel por categoría), CRUD staff
DROP POLICY IF EXISTS "jugadores_public_read" ON jugadores;
CREATE POLICY "jugadores_public_read" ON jugadores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "jugadores_staff_write" ON jugadores;
CREATE POLICY "jugadores_staff_write" ON jugadores FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

-- inscripciones: INSERT público (formulario), lectura/gestión staff
DROP POLICY IF EXISTS "inscripciones_public_insert" ON inscripciones;
CREATE POLICY "inscripciones_public_insert" ON inscripciones FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inscripciones_staff_read" ON inscripciones;
CREATE POLICY "inscripciones_staff_read" ON inscripciones FOR SELECT
  TO authenticated USING (public.es_staff_activo());

DROP POLICY IF EXISTS "inscripciones_staff_update" ON inscripciones;
CREATE POLICY "inscripciones_staff_update" ON inscripciones FOR UPDATE
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

-- mensualidades, ingresos, gastos: solo staff
DROP POLICY IF EXISTS "mensualidades_staff_all" ON mensualidades;
CREATE POLICY "mensualidades_staff_all" ON mensualidades FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

DROP POLICY IF EXISTS "ingresos_staff_all" ON ingresos;
CREATE POLICY "ingresos_staff_all" ON ingresos FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

DROP POLICY IF EXISTS "gastos_staff_all" ON gastos;
CREATE POLICY "gastos_staff_all" ON gastos FOR ALL
  TO authenticated USING (public.es_staff_activo()) WITH CHECK (public.es_staff_activo());

-- ── Índices útiles ──
CREATE INDEX IF NOT EXISTS idx_jugadores_categoria ON jugadores(categoria_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_activo ON jugadores(activo);
CREATE INDEX IF NOT EXISTS idx_mensualidades_jugador ON mensualidades(jugador_id);
CREATE INDEX IF NOT EXISTS idx_mensualidades_periodo ON mensualidades(anio, mes);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);

-- ── Seed: categorías base ──
INSERT INTO categorias (nombre, slug, anio_min, anio_max) VALUES
  ('Sub-6',  'sub-6',  2019, 2020),
  ('Sub-8',  'sub-8',  2017, 2018),
  ('Sub-10', 'sub-10', 2015, 2016),
  ('Sub-12', 'sub-12', 2013, 2014),
  ('Sub-14', 'sub-14', 2011, 2012),
  ('Sub-16', 'sub-16', 2009, 2010)
ON CONFLICT (slug) DO NOTHING;
