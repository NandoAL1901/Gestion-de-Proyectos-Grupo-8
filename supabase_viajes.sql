-- ============================================================
-- CARPOOL ULIMA - Viajes y Reservas (P2)
-- Ejecutar en el SQL Editor DESPUÉS de supabase_schema.sql.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tablas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conductor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  distrito_origen VARCHAR(100) NOT NULL,
  sentido VARCHAR(10) NOT NULL DEFAULT 'ida' CHECK (sentido IN ('ida', 'vuelta')), -- ida = hacia la U, vuelta = desde la U
  fecha DATE NOT NULL,
  hora VARCHAR(20) NOT NULL,
  asientos_totales INT NOT NULL CHECK (asientos_totales BETWEEN 1 AND 6),
  notas VARCHAR(200),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'cancelado', 'completado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha);
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor ON viajes(conductor_id);

CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  pasajero_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (viaje_id, pasajero_id)
);
CREATE INDEX IF NOT EXISTS idx_reservas_viaje ON reservas(viaje_id);
CREATE INDEX IF NOT EXISTS idx_reservas_pasajero ON reservas(pasajero_id);

-- ------------------------------------------------------------
-- 2. Regla de negocio: no exceder los asientos al confirmar
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_asientos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ocupados INT;
  total INT;
BEGIN
  IF NEW.estado = 'confirmada' THEN
    SELECT asientos_totales INTO total FROM viajes WHERE id = NEW.viaje_id;
    SELECT COUNT(*) INTO ocupados
      FROM reservas
      WHERE viaje_id = NEW.viaje_id AND estado = 'confirmada' AND id <> NEW.id;
    IF ocupados >= total THEN
      RAISE EXCEPTION 'No hay asientos disponibles en este viaje';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_asientos ON reservas;
CREATE TRIGGER trg_check_asientos
  BEFORE INSERT OR UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION check_asientos();

-- ------------------------------------------------------------
-- 3. RLS
-- ------------------------------------------------------------
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS viajes_select ON viajes;
DROP POLICY IF EXISTS viajes_insert ON viajes;
DROP POLICY IF EXISTS viajes_update ON viajes;
DROP POLICY IF EXISTS viajes_delete ON viajes;

-- Cualquier autenticado ve los viajes (marketplace)
CREATE POLICY viajes_select ON viajes FOR SELECT TO authenticated USING (true);
-- Solo un conductor publica viajes a su nombre
CREATE POLICY viajes_insert ON viajes FOR INSERT TO authenticated WITH CHECK (conductor_id = auth.uid());
-- Solo el dueño edita/cancela su viaje
CREATE POLICY viajes_update ON viajes FOR UPDATE TO authenticated USING (conductor_id = auth.uid()) WITH CHECK (conductor_id = auth.uid());
CREATE POLICY viajes_delete ON viajes FOR DELETE TO authenticated USING (conductor_id = auth.uid());

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reservas_select ON reservas;
DROP POLICY IF EXISTS reservas_insert ON reservas;
DROP POLICY IF EXISTS reservas_update ON reservas;

-- Ve la reserva el pasajero que la hizo o el conductor del viaje
CREATE POLICY reservas_select ON reservas FOR SELECT TO authenticated USING (
  pasajero_id = auth.uid()
  OR EXISTS (SELECT 1 FROM viajes v WHERE v.id = viaje_id AND v.conductor_id = auth.uid())
);
-- Solo el propio pasajero crea su reserva
CREATE POLICY reservas_insert ON reservas FOR INSERT TO authenticated WITH CHECK (pasajero_id = auth.uid());
-- Actualiza el pasajero (cancelar) o el conductor del viaje (confirmar/rechazar)
CREATE POLICY reservas_update ON reservas FOR UPDATE TO authenticated USING (
  pasajero_id = auth.uid()
  OR EXISTS (SELECT 1 FROM viajes v WHERE v.id = viaje_id AND v.conductor_id = auth.uid())
);

-- ------------------------------------------------------------
-- 4. Vistas de detalle (exponen datos seguros del otro usuario)
--    La condición WHERE con auth.uid() limita qué filas ve cada quien,
--    y las columnas expuestas ocultan correo/código y teléfonos privados.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW viajes_detalle AS
SELECT
  v.id, v.conductor_id, v.distrito_origen, v.sentido, v.fecha, v.hora,
  v.asientos_totales, v.notas, v.estado, v.created_at,
  u.nombre_completo AS conductor_nombre,
  u.carrera        AS conductor_carrera,
  u.modelo_auto,
  u.mostrar_telefono,
  CASE WHEN u.mostrar_telefono THEN u.telefono ELSE NULL END AS conductor_telefono,
  (SELECT COUNT(*) FROM reservas r WHERE r.viaje_id = v.id AND r.estado = 'confirmada') AS asientos_ocupados
FROM viajes v
JOIN usuarios u ON u.id = v.conductor_id
WHERE u.activo = true;

REVOKE ALL ON viajes_detalle FROM anon;
GRANT SELECT ON viajes_detalle TO authenticated;

CREATE OR REPLACE VIEW reservas_detalle AS
SELECT
  r.id, r.viaje_id, r.pasajero_id, r.estado, r.created_at,
  v.conductor_id, v.distrito_origen, v.sentido, v.fecha, v.hora,
  v.estado AS viaje_estado,
  p.nombre_completo AS pasajero_nombre,
  p.carrera        AS pasajero_carrera,
  CASE WHEN p.mostrar_telefono THEN p.telefono ELSE NULL END AS pasajero_telefono,
  c.nombre_completo AS conductor_nombre,
  c.modelo_auto,
  CASE WHEN c.mostrar_telefono THEN c.telefono ELSE NULL END AS conductor_telefono
FROM reservas r
JOIN viajes v   ON v.id = r.viaje_id
JOIN usuarios p ON p.id = r.pasajero_id
JOIN usuarios c ON c.id = v.conductor_id
WHERE r.pasajero_id = auth.uid() OR v.conductor_id = auth.uid();

REVOKE ALL ON reservas_detalle FROM anon;
GRANT SELECT ON reservas_detalle TO authenticated;
