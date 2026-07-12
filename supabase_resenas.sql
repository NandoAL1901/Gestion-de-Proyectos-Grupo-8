-- ============================================================
-- CARPOOL ULIMA - Reseñas y reputación (P2)
-- Ejecutar DESPUÉS de supabase_schema.sql y supabase_viajes.sql.
-- Idempotente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de reseñas
--    Un pasajero califica al conductor de una reserva confirmada.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,        -- califica (pasajero)
  destinatario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, -- calificado (conductor)
  puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reserva_id, autor_id)
);
CREATE INDEX IF NOT EXISTS idx_resenas_destinatario ON resenas(destinatario_id);

-- ------------------------------------------------------------
-- 2. RLS
-- ------------------------------------------------------------
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS resenas_select ON resenas;
DROP POLICY IF EXISTS resenas_insert ON resenas;
DROP POLICY IF EXISTS resenas_update ON resenas;
DROP POLICY IF EXISTS resenas_delete ON resenas;

-- Cualquier autenticado lee reseñas (para mostrar la reputación)
CREATE POLICY resenas_select ON resenas FOR SELECT TO authenticated USING (true);

-- Solo puedes crear una reseña como autor, para un conductor con quien tuviste
-- una reserva CONFIRMADA en ese mismo viaje.
CREATE POLICY resenas_insert ON resenas FOR INSERT TO authenticated WITH CHECK (
  autor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM reservas r
    JOIN viajes v ON v.id = r.viaje_id
    WHERE r.id = reserva_id
      AND r.pasajero_id = auth.uid()
      AND r.estado = 'confirmada'
      AND v.conductor_id = destinatario_id
  )
);

-- El autor puede editar/borrar su propia reseña
CREATE POLICY resenas_update ON resenas FOR UPDATE TO authenticated USING (autor_id = auth.uid()) WITH CHECK (autor_id = auth.uid());
CREATE POLICY resenas_delete ON resenas FOR DELETE TO authenticated USING (autor_id = auth.uid());

-- ------------------------------------------------------------
-- 3. Vista de reputación (promedio y total por usuario)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW reputacion_usuarios AS
SELECT
  destinatario_id AS usuario_id,
  ROUND(AVG(puntuacion)::numeric, 1) AS promedio,
  COUNT(*) AS total
FROM resenas
GROUP BY destinatario_id;

REVOKE ALL ON reputacion_usuarios FROM anon;
GRANT SELECT ON reputacion_usuarios TO authenticated;

-- Vista con las reseñas y el nombre del autor (para mostrar comentarios en el perfil)
CREATE OR REPLACE VIEW resenas_detalle AS
SELECT
  re.id, re.destinatario_id, re.autor_id, re.puntuacion, re.comentario, re.created_at,
  a.nombre_completo AS autor_nombre
FROM resenas re
JOIN usuarios a ON a.id = re.autor_id;

REVOKE ALL ON resenas_detalle FROM anon;
GRANT SELECT ON resenas_detalle TO authenticated;
