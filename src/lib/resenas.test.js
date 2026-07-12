import { describe, it, expect } from 'vitest'
import { estrellasLlenas, reputacionTexto, mapaReputacion } from './resenas'

describe('estrellasLlenas', () => {
  it('redondea el promedio a 0-5', () => {
    expect(estrellasLlenas(4.5)).toBe(5)
    expect(estrellasLlenas(4.4)).toBe(4)
    expect(estrellasLlenas(0)).toBe(0)
  })
  it('acota fuera de rango y valores inválidos', () => {
    expect(estrellasLlenas(9)).toBe(5)
    expect(estrellasLlenas(-2)).toBe(0)
    expect(estrellasLlenas(undefined)).toBe(0)
  })
})

describe('reputacionTexto', () => {
  it('muestra promedio y total', () => {
    expect(reputacionTexto({ promedio: 4.5, total: 8 })).toBe('4.5 · 8 reseñas')
    expect(reputacionTexto({ promedio: 5, total: 1 })).toBe('5 · 1 reseña')
  })
  it('mensaje por defecto sin reseñas', () => {
    expect(reputacionTexto(null)).toBe('Sin reseñas aún')
    expect(reputacionTexto({ promedio: 0, total: 0 })).toBe('Sin reseñas aún')
  })
})

describe('mapaReputacion', () => {
  it('indexa por usuario_id', () => {
    const m = mapaReputacion([{ usuario_id: 'a', promedio: 4, total: 2 }])
    expect(m.a).toEqual({ promedio: 4, total: 2 })
    expect(m.b).toBeUndefined()
  })
  it('tolera lista vacía o nula', () => {
    expect(mapaReputacion(null)).toEqual({})
  })
})
