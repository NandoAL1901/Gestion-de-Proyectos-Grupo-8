import { describe, it, expect } from 'vitest'
import { distritosCercanos, calcularCompatibilidad, ordenarPorCompatibilidad } from './matching'

describe('distritosCercanos', () => {
  it('incluye el propio distrito primero y luego los vecinos', () => {
    const r = distritosCercanos('Miraflores')
    expect(r[0]).toBe('Miraflores')
    expect(r).toContain('Barranco')
    expect(r).toContain('San Isidro')
  })
  it('devuelve solo el distrito si no hay vecinos mapeados', () => {
    expect(distritosCercanos('Distrito Inexistente')).toEqual(['Distrito Inexistente'])
  })
})

describe('calcularCompatibilidad', () => {
  const base = { tipo_usuario: 'pasajero', distrito: 'Miraflores', horario_entrada: '7:00 am', horario_salida: '3:00 pm' }

  it('da score alto a un conductor del mismo distrito y horario', () => {
    const cand = { tipo_usuario: 'conductor', distrito: 'Miraflores', horario_entrada: '7:00 am', horario_salida: '3:00 pm' }
    const r = calcularCompatibilidad(base, cand)
    // 40 (rol) + 35 (distrito) + 20 (entrada) + 5 (salida) = 100
    expect(r.score).toBe(100)
    expect(r.nivel).toBe('alta')
    expect(r.razones).toContain('Te puede llevar')
    expect(r.razones).toContain('Mismo distrito')
  })

  it('penaliza distrito vecino y rol igual', () => {
    const cand = { tipo_usuario: 'pasajero', distrito: 'Barranco', horario_entrada: '9:00 am', horario_salida: null }
    const r = calcularCompatibilidad(base, cand)
    // 0 (mismo rol) + 20 (vecino) + 0 (entrada lejana) = 20
    expect(r.score).toBe(20)
    expect(r.nivel).toBe('baja')
    expect(r.razones).toContain('Distrito vecino')
  })

  it('suma parcial por horario de entrada contiguo', () => {
    const cand = { tipo_usuario: 'conductor', distrito: 'Miraflores', horario_entrada: '8:00 am', horario_salida: null }
    const r = calcularCompatibilidad(base, cand)
    // 40 + 35 + 8 (contiguo) = 83
    expect(r.score).toBe(83)
    expect(r.razones).toContain('Horario de entrada similar')
  })

  it('marca "Busca conductor" cuando el candidato es pasajero y el usuario conductor', () => {
    const conductor = { ...base, tipo_usuario: 'conductor' }
    const cand = { tipo_usuario: 'pasajero', distrito: 'Miraflores', horario_entrada: '7:00 am' }
    const r = calcularCompatibilidad(conductor, cand)
    expect(r.razones).toContain('Busca conductor')
  })

  it('nunca supera 100', () => {
    const cand = { tipo_usuario: 'conductor', distrito: 'Miraflores', horario_entrada: '7:00 am', horario_salida: '3:00 pm' }
    expect(calcularCompatibilidad(base, cand).score).toBeLessThanOrEqual(100)
  })
})

describe('ordenarPorCompatibilidad', () => {
  const usuario = { tipo_usuario: 'pasajero', distrito: 'Miraflores', horario_entrada: '7:00 am' }
  const candidatos = [
    { id: 'a', tipo_usuario: 'pasajero', distrito: 'Barranco', horario_entrada: '9:00 am', created_at: '2026-01-01' },
    { id: 'b', tipo_usuario: 'conductor', distrito: 'Miraflores', horario_entrada: '7:00 am', created_at: '2026-01-01' },
  ]

  it('ordena el mejor match primero y anexa _compat', () => {
    const r = ordenarPorCompatibilidad(usuario, candidatos)
    expect(r[0].id).toBe('b')
    expect(r[0]._compat.score).toBeGreaterThan(r[1]._compat.score)
  })

  it('no muta el arreglo original', () => {
    const original = [...candidatos]
    ordenarPorCompatibilidad(usuario, candidatos)
    expect(candidatos).toEqual(original)
  })
})
