// Helpers de reputación/reseñas.

/** Nº de estrellas llenas (0-5) para un promedio dado. */
export const estrellasLlenas = (promedio) =>
  Math.max(0, Math.min(5, Math.round(Number(promedio) || 0)))

/** Texto corto de reputación, ej: "4.5 · 8 reseñas" o "Sin reseñas aún". */
export const reputacionTexto = (rep) =>
  rep && rep.total > 0
    ? `${rep.promedio} · ${rep.total} reseña${rep.total !== 1 ? 's' : ''}`
    : 'Sin reseñas aún'

/** Convierte una lista de filas de reputacion_usuarios en un mapa por usuario_id. */
export const mapaReputacion = (filas) => {
  const m = {}
  for (const f of filas || []) m[f.usuario_id] = { promedio: f.promedio, total: f.total }
  return m
}
