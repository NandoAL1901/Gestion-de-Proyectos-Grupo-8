-- ============================================================
-- CARPOOL ULIMA - Métricas para análisis / presentación
-- Ejecuta cada bloque por separado en el SQL Editor de Supabase.
-- Puedes descargar cada resultado como CSV (botón "Download" del editor)
-- para pegarlo en tu informe o hacer gráficos en Excel/Sheets.
-- ============================================================

-- 1) RESUMEN GENERAL --------------------------------------------------
SELECT
  count(*)                                                  AS total_usuarios,
  count(*) FILTER (WHERE tipo_usuario = 'conductor')        AS conductores,
  count(*) FILTER (WHERE tipo_usuario = 'pasajero')         AS pasajeros,
  round(100.0 * count(*) FILTER (WHERE tipo_usuario = 'conductor') / nullif(count(*),0), 1) AS pct_conductores,
  round(100.0 * count(*) FILTER (WHERE tipo_usuario = 'pasajero')  / nullif(count(*),0), 1) AS pct_pasajeros,
  count(DISTINCT distrito)                                  AS distritos_cubiertos
FROM usuarios
WHERE activo = true;

-- 2) USUARIOS POR DISTRITO (oferta vs demanda) ------------------------
--    "pasajeros_por_conductor" = cuántos pasajeros compiten por cada conductor.
SELECT
  distrito,
  count(*)                                            AS total,
  count(*) FILTER (WHERE tipo_usuario = 'conductor')  AS conductores,
  count(*) FILTER (WHERE tipo_usuario = 'pasajero')   AS pasajeros,
  round(
    count(*) FILTER (WHERE tipo_usuario = 'pasajero')::numeric
    / nullif(count(*) FILTER (WHERE tipo_usuario = 'conductor'), 0), 1
  ) AS pasajeros_por_conductor
FROM usuarios
WHERE activo = true
GROUP BY distrito
ORDER BY total DESC;

-- 3) USUARIOS POR CARRERA ---------------------------------------------
SELECT carrera, count(*) AS total,
  round(100.0 * count(*) / sum(count(*)) OVER (), 1) AS porcentaje
FROM usuarios
WHERE activo = true
GROUP BY carrera
ORDER BY total DESC;

-- 4) DISTRIBUCIÓN POR HORA DE ENTRADA (horas pico) --------------------
SELECT horario_entrada, count(*) AS estudiantes
FROM usuarios
WHERE activo = true AND horario_entrada IS NOT NULL
GROUP BY horario_entrada
ORDER BY count(*) DESC;

-- 5) PRIVACIDAD: cuántos muestran su teléfono -------------------------
SELECT
  count(*) FILTER (WHERE mostrar_telefono)      AS telefono_visible,
  count(*) FILTER (WHERE NOT mostrar_telefono)  AS telefono_oculto,
  round(100.0 * count(*) FILTER (WHERE mostrar_telefono) / nullif(count(*),0), 1) AS pct_visible
FROM usuarios
WHERE activo = true;

-- 6) VIAJES: total, por estado y por sentido --------------------------
SELECT estado, sentido, count(*) AS viajes
FROM viajes
GROUP BY estado, sentido
ORDER BY estado, sentido;

-- 7) RESERVAS: embudo y tasa de confirmación --------------------------
SELECT
  count(*)                                              AS total_reservas,
  count(*) FILTER (WHERE estado = 'pendiente')          AS pendientes,
  count(*) FILTER (WHERE estado = 'confirmada')         AS confirmadas,
  count(*) FILTER (WHERE estado = 'rechazada')          AS rechazadas,
  count(*) FILTER (WHERE estado = 'cancelada')          AS canceladas,
  round(100.0 * count(*) FILTER (WHERE estado = 'confirmada') / nullif(count(*),0), 1) AS tasa_confirmacion_pct
FROM reservas;

-- 8) REPUTACIÓN: promedio general y distribución de estrellas ---------
SELECT
  round(avg(puntuacion), 2) AS promedio_general,
  count(*)                  AS total_resenas
FROM resenas;

SELECT puntuacion, count(*) AS cantidad
FROM resenas
GROUP BY puntuacion
ORDER BY puntuacion DESC;

-- 9) TOP CONDUCTORES MEJOR CALIFICADOS (con al menos 1 reseña) --------
SELECT u.nombre_completo, u.distrito, r.promedio, r.total AS resenas
FROM reputacion_usuarios r
JOIN usuarios u ON u.id = r.usuario_id
ORDER BY r.promedio DESC, r.total DESC
LIMIT 10;

-- 10) CRECIMIENTO: registros por día ---------------------------------
SELECT date(created_at) AS dia, count(*) AS nuevos_usuarios
FROM usuarios
WHERE activo = true
GROUP BY date(created_at)
ORDER BY dia;
