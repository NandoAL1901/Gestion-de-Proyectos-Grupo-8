// Lógica de "matching inteligente": puntúa qué tan compatible es un candidato
// con el usuario actual, considerando rol, cercanía de distrito y horarios.
import { HORARIOS, DISTRITOS_VECINOS } from './constants'

/** Distrito del usuario + sus distritos vecinos (para ampliar la búsqueda). */
export const distritosCercanos = (distrito) => {
  const vecinos = DISTRITOS_VECINOS[distrito] || []
  return [distrito, ...vecinos]
}

const franja = (h) => HORARIOS.indexOf(h)

/**
 * Calcula la compatibilidad entre el usuario y un candidato.
 * Devuelve { score (0-100), nivel ('alta'|'media'|'baja'), razones[] }.
 *
 * Pesos (un carpool real necesita, sobre todo, roles complementarios y cercanía):
 *  - Rol complementario (pasajero ↔ conductor): +40
 *  - Mismo distrito: +35 · Distrito vecino: +20
 *  - Misma hora de entrada: +20 · Hora de entrada contigua (±1): +8
 *  - Misma hora de salida: +5
 */
export function calcularCompatibilidad(usuario, candidato) {
  let score = 0
  const razones = []

  // Rol complementario
  if (usuario.tipo_usuario !== candidato.tipo_usuario) {
    score += 40
    razones.push(candidato.tipo_usuario === 'conductor' ? 'Te puede llevar' : 'Busca conductor')
  }

  // Cercanía de distrito
  if (candidato.distrito === usuario.distrito) {
    score += 35
    razones.push('Mismo distrito')
  } else {
    score += 20
    razones.push('Distrito vecino')
  }

  // Hora de entrada
  const fi = franja(usuario.horario_entrada)
  const fj = franja(candidato.horario_entrada)
  if (fi >= 0 && fj >= 0) {
    if (fi === fj) {
      score += 20
      razones.push('Mismo horario de entrada')
    } else if (Math.abs(fi - fj) === 1) {
      score += 8
      razones.push('Horario de entrada similar')
    }
  }

  // Hora de salida
  if (usuario.horario_salida && candidato.horario_salida && usuario.horario_salida === candidato.horario_salida) {
    score += 5
    razones.push('Misma hora de salida')
  }

  score = Math.min(score, 100)
  const nivel = score >= 70 ? 'alta' : score >= 45 ? 'media' : 'baja'
  return { score, nivel, razones }
}

/**
 * Devuelve la lista de candidatos ordenada por compatibilidad (mejor primero),
 * anexando `_compat` a cada uno. En empate, el más reciente primero.
 */
export function ordenarPorCompatibilidad(usuario, candidatos) {
  return candidatos
    .map(c => ({ ...c, _compat: calcularCompatibilidad(usuario, c) }))
    .sort((a, b) => {
      if (b._compat.score !== a._compat.score) return b._compat.score - a._compat.score
      return new Date(b.created_at) - new Date(a.created_at)
    })
}
