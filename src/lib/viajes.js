// Helpers de la funcionalidad de viajes/reservas.

export const SENTIDO_LABEL = {
  ida: 'Hacia la U',
  vuelta: 'Desde la U',
}

export const ESTADO_RESERVA = {
  pendiente: { label: 'Pendiente', color: '#92400E', bg: '#FEF3C7' },
  confirmada: { label: 'Confirmada', color: '#15803D', bg: '#E8F5EF' },
  rechazada: { label: 'Rechazada', color: '#B84040', bg: '#FEF2F2' },
  cancelada: { label: 'Cancelada', color: '#6B6B67', bg: '#F1F0EC' },
}

/** Asientos libres de un viaje (nunca negativo). */
export const asientosDisponibles = (viaje) => {
  const total = Number(viaje?.asientos_totales) || 0
  const ocupados = Number(viaje?.asientos_ocupados) || 0
  return Math.max(0, total - ocupados)
}

/** ¿El viaje aún admite reservas? (activo, con fecha futura y asientos libres) */
export const viajeReservable = (viaje, hoyISO = fechaHoyISO()) =>
  viaje?.estado === 'activo' && viaje?.fecha >= hoyISO && asientosDisponibles(viaje) > 0

/** Fecha de hoy en formato ISO (YYYY-MM-DD), hora local. */
export function fechaHoyISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Formatea 'YYYY-MM-DD' a algo legible en español (ej: "vie 12 jul"). */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const d = new Date(fechaISO + 'T00:00:00')
  if (isNaN(d)) return fechaISO
  return new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(d)
    .replace(/\.,?/g, '')
}
