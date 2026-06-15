-- ════════════════════════════════════════════════════════════════
-- MIGRACIÓN MULTI-TENANT (escuelas)
-- Convierte el sistema en multi-escuela. Conserva los datos actuales
-- migrándolos a la escuela "huachipato". Ejecutar en Supabase → SQL Editor.
-- Es idempotente (seguro de re-ejecutar).
-- ════════════════════════════════════════════════════════════════

-- 1) Tabla de escuelas (tenants)
CREATE TABLE IF NOT EXISTS escuelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  color_primary TEXT NOT NULL DEFAULT '#2952c8',
  color_primary_soft TEXT NOT NULL DEFAULT '#6a8ee0',
  hero_titulo TEXT,
  hero_subtitulo TEXT,
  telefono_whatsapp TEXT,
  email_contacto TEXT,
  datos_transferencia TEXT,
  instagram TEXT,
  facebook TEXT,
  horario_entrenamiento TEXT,
  direccion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE escuelas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "escuelas_public_read" ON escuelas;
CREATE POLICY "escuelas_public_read" ON escuelas FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "escuelas_superadmin_write" ON escuelas;
CREATE POLICY "escuelas_superadmin_write" ON escuelas FOR ALL
  TO authenticated USING (public.es_superadmin()) WITH CHECK (public.es_superadmin());

-- 2) Agregar escuela_id a todas las tablas (nullable por ahora)
ALTER TABLE profiles       ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE categorias     ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE jugadores      ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE inscripciones  ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE mensualidades  ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE ingresos       ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE gastos         ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE noticias       ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE galeria_fotos  ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE productos      ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);
ALTER TABLE cuerpo_tecnico ADD COLUMN IF NOT EXISTS escuela_id UUID REFERENCES escuelas(id);

-- 3) Crear la escuela "huachipato" tomando datos del singleton ajustes (si existe)
INSERT INTO escuelas (
  slug, nombre, hero_titulo, hero_subtitulo, telefono_whatsapp,
  email_contacto, datos_transferencia, instagram, facebook,
  horario_entrenamiento, direccion
)
SELECT
  'huachipato',
  'Academia de Fútbol Huachipato — Filial Talca',
  COALESCE((SELECT hero_titulo FROM ajustes WHERE id = 1), 'Formamos deportistas, forjamos personas'),
  (SELECT hero_subtitulo FROM ajustes WHERE id = 1),
  (SELECT telefono_whatsapp FROM ajustes WHERE id = 1),
  (SELECT email_contacto FROM ajustes WHERE id = 1),
  (SELECT datos_transferencia FROM ajustes WHERE id = 1),
  (SELECT instagram FROM ajustes WHERE id = 1),
  (SELECT facebook FROM ajustes WHERE id = 1),
  (SELECT horario_entrenamiento FROM ajustes WHERE id = 1),
  (SELECT direccion FROM ajustes WHERE id = 1)
ON CONFLICT (slug) DO NOTHING;

-- 4) Backfill: asignar todos los datos existentes a la escuela huachipato
DO $$
DECLARE hid UUID;
BEGIN
  SELECT id INTO hid FROM escuelas WHERE slug = 'huachipato';
  UPDATE profiles       SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE categorias     SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE jugadores      SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE inscripciones  SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE mensualidades  SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE ingresos       SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE gastos         SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE noticias       SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE galeria_fotos  SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE productos      SET escuela_id = hid WHERE escuela_id IS NULL;
  UPDATE cuerpo_tecnico SET escuela_id = hid WHERE escuela_id IS NULL;
END $$;

-- 5) Helper: escuela del usuario autenticado
CREATE OR REPLACE FUNCTION public.mi_escuela()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT escuela_id FROM profiles WHERE id = auth.uid();
$$;

-- 6) Índices por escuela
CREATE INDEX IF NOT EXISTS idx_jugadores_escuela ON jugadores(escuela_id);
CREATE INDEX IF NOT EXISTS idx_categorias_escuela ON categorias(escuela_id);
CREATE INDEX IF NOT EXISTS idx_noticias_escuela ON noticias(escuela_id);
CREATE INDEX IF NOT EXISTS idx_productos_escuela ON productos(escuela_id);
CREATE INDEX IF NOT EXISTS idx_galeria_escuela ON galeria_fotos(escuela_id);
CREATE INDEX IF NOT EXISTS idx_cuerpo_escuela ON cuerpo_tecnico(escuela_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_escuela ON inscripciones(escuela_id);
CREATE INDEX IF NOT EXISTS idx_mensualidades_escuela ON mensualidades(escuela_id);

-- 7) RLS por escuela: escritura solo en la propia escuela (o superadmin plataforma)
--    Lectura pública se mantiene (la app filtra por escuela_id).
DO $$
DECLARE
  t TEXT;
  tablas TEXT[] := ARRAY[
    'categorias','jugadores','mensualidades','ingresos','gastos',
    'noticias','galeria_fotos','productos','cuerpo_tecnico'
  ];
BEGIN
  FOREACH t IN ARRAY tablas LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_public_read" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_public_read" ON %I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_staff_write" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_staff_all" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_tenant_write" ON %I FOR ALL TO authenticated ' ||
      'USING ((public.es_staff_activo() AND escuela_id = public.mi_escuela()) OR public.es_superadmin()) ' ||
      'WITH CHECK ((public.es_staff_activo() AND escuela_id = public.mi_escuela()) OR public.es_superadmin())',
      t, t);
  END LOOP;
END $$;

-- inscripciones: INSERT público (formulario) + lectura/gestión por escuela
DROP POLICY IF EXISTS "inscripciones_public_insert" ON inscripciones;
CREATE POLICY "inscripciones_public_insert" ON inscripciones FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inscripciones_staff_read" ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_staff_update" ON inscripciones;
DROP POLICY IF EXISTS "inscripciones_tenant_rw" ON inscripciones;
CREATE POLICY "inscripciones_tenant_rw" ON inscripciones FOR SELECT
  TO authenticated USING (escuela_id = public.mi_escuela() OR public.es_superadmin());
DROP POLICY IF EXISTS "inscripciones_tenant_update" ON inscripciones;
CREATE POLICY "inscripciones_tenant_update" ON inscripciones FOR UPDATE
  TO authenticated USING (escuela_id = public.mi_escuela() OR public.es_superadmin())
  WITH CHECK (escuela_id = public.mi_escuela() OR public.es_superadmin());
