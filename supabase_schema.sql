-- ============================================================
-- CARPOOL ULIMA - Esquema de Base de Datos (Supabase / PostgreSQL)
-- ------------------------------------------------------------
-- Ejecuta este archivo completo en el SQL Editor de Supabase.
-- Es IDEMPOTENTE: puedes volver a ejecutarlo sin perder datos;
-- crea lo que falte y actualiza políticas/funciones.
--
-- ⚠️  REQUISITO DEL FLUJO DE REGISTRO:
--     En Supabase → Authentication → Providers → Email,
--     mantén "Confirm email" DESACTIVADO. Así el signUp devuelve
--     una sesión inmediata y el INSERT del perfil (protegido por
--     auth.uid() = id) funciona en el mismo paso.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_ulima VARCHAR(8) NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  carrera VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('pasajero', 'conductor')),
  horario_entrada VARCHAR(20),
  horario_salida VARCHAR(20),
  -- Perfil
  bio VARCHAR(200),
  mostrar_telefono BOOLEAN NOT NULL DEFAULT true,
  -- Campos solo para conductores
  modelo_auto VARCHAR(100),
  placa_auto VARCHAR(20),
  asientos_disponibles INTEGER CHECK (asientos_disponibles BETWEEN 1 AND 6),
  -- Metadatos
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migración para bases de datos ya existentes (columnas nuevas)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio VARCHAR(200);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mostrar_telefono BOOLEAN NOT NULL DEFAULT true;

-- ------------------------------------------------------------
-- 2. Índices para búsquedas frecuentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_distrito ON usuarios(distrito);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo     ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo   ON usuarios(activo);

-- ------------------------------------------------------------
-- 3. Trigger para mantener updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 4. Row Level Security (RLS)
--    Cada usuario SOLO puede leer/insertar/editar SU propia fila.
--    Los datos de otros usuarios se consultan mediante la vista
--    segura `usuarios_directorio` (que oculta correo, código y
--    los teléfonos privados). Esto evita que cualquiera con la
--    anon key pueda descargar todos los datos personales.
-- ------------------------------------------------------------
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Elimina políticas antiguas (nombres previos y nuevos) para re-ejecutar sin error
DROP POLICY IF EXISTS "Registro público" ON usuarios;
DROP POLICY IF EXISTS "Lectura pública de usuarios activos" ON usuarios;
DROP POLICY IF EXISTS "Actualización propia" ON usuarios;
DROP POLICY IF EXISTS usuarios_select_own ON usuarios;
DROP POLICY IF EXISTS usuarios_insert_own ON usuarios;
DROP POLICY IF EXISTS usuarios_update_own ON usuarios;

-- Leer solo la propia fila
CREATE POLICY usuarios_select_own ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Insertar solo una fila cuyo id sea el del usuario autenticado
CREATE POLICY usuarios_insert_own ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Actualizar solo la propia fila
CREATE POLICY usuarios_update_own ON usuarios
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- 5. Vista pública de directorio (para el matching)
--    Expone únicamente columnas seguras y oculta el teléfono
--    de quien eligió no mostrarlo. NO incluye correo ni código.
--    Solo lectura para usuarios autenticados.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW usuarios_directorio AS
SELECT
  id,
  nombre_completo,
  carrera,
  distrito,
  tipo_usuario,
  horario_entrada,
  horario_salida,
  bio,
  modelo_auto,
  asientos_disponibles,
  mostrar_telefono,
  CASE WHEN mostrar_telefono THEN telefono ELSE NULL END AS telefono,
  created_at
FROM usuarios
WHERE activo = true;

REVOKE ALL ON usuarios_directorio FROM anon;
GRANT SELECT ON usuarios_directorio TO authenticated;

-- ------------------------------------------------------------
-- 6. Funciones RPC (SECURITY DEFINER) para datos públicos seguros
-- ------------------------------------------------------------

-- Estadísticas agregadas para la landing (sin exponer filas)
CREATE OR REPLACE FUNCTION estadisticas_publicas()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total',       COUNT(*),
    'conductores', COUNT(*) FILTER (WHERE tipo_usuario = 'conductor'),
    'pasajeros',   COUNT(*) FILTER (WHERE tipo_usuario = 'pasajero'),
    'distritos',   COUNT(DISTINCT distrito)
  )
  FROM usuarios
  WHERE activo = true;
$$;

-- ¿Existe una cuenta con este correo? (para el flujo de login)
CREATE OR REPLACE FUNCTION email_registrado(p_correo text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE lower(correo) = lower(p_correo) AND activo = true
  );
$$;

-- ¿Ya está tomado este código de alumno? (para evitar cuentas huérfanas)
CREATE OR REPLACE FUNCTION codigo_registrado(p_codigo text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM usuarios WHERE codigo_ulima = p_codigo);
$$;

REVOKE ALL ON FUNCTION estadisticas_publicas()        FROM public;
REVOKE ALL ON FUNCTION email_registrado(text)         FROM public;
REVOKE ALL ON FUNCTION codigo_registrado(text)        FROM public;
GRANT EXECUTE ON FUNCTION estadisticas_publicas()     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION email_registrado(text)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION codigo_registrado(text)     TO anon, authenticated;
