-- ============================================================
-- CARPOOL ULIMA - Esquema de Base de Datos Supabase
-- Ejecutar este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_ulima VARCHAR(8) NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  carrera VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('pasajero', 'conductor')),
  horario_entrada VARCHAR(20),
  horario_salida VARCHAR(20),
  -- Campos solo para conductores
  modelo_auto VARCHAR(100),
  placa_auto VARCHAR(20),
  asientos_disponibles INTEGER,
  -- Metadatos
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_distrito ON usuarios(distrito);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo ON usuarios(codigo_ulima);

-- RLS (Row Level Security) - todos pueden leer, insertar propios datos
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: cualquiera puede insertar (registro público)
CREATE POLICY "Registro público" ON usuarios
  FOR INSERT WITH CHECK (true);

-- Policy: cualquiera puede leer usuarios activos (para el matching)
CREATE POLICY "Lectura pública de usuarios activos" ON usuarios
  FOR SELECT USING (activo = true);

-- Policy: solo el propio usuario puede actualizar sus datos
-- (Para implementar auth real, usar auth.uid())
CREATE POLICY "Actualización propia" ON usuarios
  FOR UPDATE USING (true);
