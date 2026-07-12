import { describe, it, expect } from 'vitest'
import { asientosDisponibles, viajeReservable, formatearFecha } from './viajes'

describe('asientosDisponibles', () => {
  it('resta ocupados de totales', () => {
    expect(asientosDisponibles({ asientos_totales: 4, asientos_ocupados: 1 })).toBe(3)
  })
  it('nunca es negativo', () => {
    expect(asientosDisponibles({ asientos_totales: 2, asientos_ocupados: 5 })).toBe(0)
  })
  it('tolera valores faltantes', () => {
    expect(asientosDisponibles({ asientos_totales: 3 })).toBe(3)
    expect(asientosDisponibles(null)).toBe(0)
  })
})

describe('viajeReservable', () => {
  const hoy = '2026-07-12'
  it('reservable si activo, futuro y con asientos', () => {
    expect(viajeReservable({ estado: 'activo', fecha: '2026-07-20', asientos_totales: 4, asientos_ocupados: 1 }, hoy)).toBe(true)
  })
  it('no reservable si está lleno', () => {
    expect(viajeReservable({ estado: 'activo', fecha: '2026-07-20', asientos_totales: 2, asientos_ocupados: 2 }, hoy)).toBe(false)
  })
  it('no reservable si la fecha ya pasó', () => {
    expect(viajeReservable({ estado: 'activo', fecha: '2026-07-01', asientos_totales: 4, asientos_ocupados: 0 }, hoy)).toBe(false)
  })
  it('no reservable si está cancelado', () => {
    expect(viajeReservable({ estado: 'cancelado', fecha: '2026-07-20', asientos_totales: 4, asientos_ocupados: 0 }, hoy)).toBe(false)
  })
})

describe('formatearFecha', () => {
  it('devuelve string no vacío para fecha válida', () => {
    expect(formatearFecha('2026-07-12')).toBeTruthy()
  })
  it('maneja valores vacíos', () => {
    expect(formatearFecha('')).toBe('')
  })
})
