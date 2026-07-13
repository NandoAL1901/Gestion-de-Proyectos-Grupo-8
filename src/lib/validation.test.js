import { describe, it, expect } from 'vitest'
import {
  esCorreoUlima,
  esCorreoUlimaValido,
  esCodigoValido,
  soloDigitos,
  esTelefonoValido,
  normalizarTelefono,
  whatsappUrl,
  esPlacaValida,
} from './validation'

describe('esCorreoUlima', () => {
  it('acepta el dominio institucional', () => {
    expect(esCorreoUlima('20204353@aloe.ulima.edu.pe')).toBe(true)
    expect(esCorreoUlima('  20204353@ALOE.ULIMA.EDU.PE  ')).toBe(true)
  })
  it('rechaza otros dominios y valores no string', () => {
    expect(esCorreoUlima('alguien@gmail.com')).toBe(false)
    expect(esCorreoUlima('alguien@ulima.edu.pe')).toBe(false)
    expect(esCorreoUlima('')).toBe(false)
    expect(esCorreoUlima(null)).toBe(false)
  })
})

describe('esCodigoValido', () => {
  it('acepta 8 dígitos con año 2020-2026', () => {
    expect(esCodigoValido('20204353')).toBe(true)
    expect(esCodigoValido('20260001')).toBe(true)
    expect(esCodigoValido('20239999')).toBe(true)
  })
  it('rechaza año fuera de 2020-2026', () => {
    expect(esCodigoValido('20194353')).toBe(false) // 2019
    expect(esCodigoValido('20274353')).toBe(false) // 2027
    expect(esCodigoValido('19994353')).toBe(false) // 1999
  })
  it('rechaza longitud o caracteres inválidos', () => {
    expect(esCodigoValido('2020435')).toBe(false)   // 7
    expect(esCodigoValido('202043530')).toBe(false) // 9
    expect(esCodigoValido('2020435a')).toBe(false)  // letra
  })
})

describe('esCorreoUlimaValido', () => {
  it('acepta correo cuyo usuario es un código válido', () => {
    expect(esCorreoUlimaValido('20204353@aloe.ulima.edu.pe')).toBe(true)
    expect(esCorreoUlimaValido('  20260001@ALOE.ULIMA.EDU.PE ')).toBe(true)
  })
  it('rechaza dominio o código inválidos', () => {
    expect(esCorreoUlimaValido('20204353@gmail.com')).toBe(false)
    expect(esCorreoUlimaValido('20194353@aloe.ulima.edu.pe')).toBe(false) // año 2019
    expect(esCorreoUlimaValido('juan@aloe.ulima.edu.pe')).toBe(false)     // no numérico
    expect(esCorreoUlimaValido('')).toBe(false)
  })
})

describe('soloDigitos', () => {
  it('quita todo lo no numérico', () => {
    expect(soloDigitos('+51 987-654 321')).toBe('51987654321')
    expect(soloDigitos(null)).toBe('')
  })
})

describe('esTelefonoValido', () => {
  it('acepta celulares peruanos (9 dígitos, empieza en 9)', () => {
    expect(esTelefonoValido('987654321')).toBe(true)
    expect(esTelefonoValido('987 654 321')).toBe(true)
    expect(esTelefonoValido('+51 987654321')).toBe(true)
    expect(esTelefonoValido('51987654321')).toBe(true)
  })
  it('rechaza números inválidos', () => {
    expect(esTelefonoValido('887654321')).toBe(false) // no empieza en 9
    expect(esTelefonoValido('98765432')).toBe(false)  // 8 dígitos
    expect(esTelefonoValido('9876543210')).toBe(false) // 10 dígitos
    expect(esTelefonoValido('')).toBe(false)
  })
})

describe('normalizarTelefono', () => {
  it('devuelve 9 dígitos nacionales sin prefijo país', () => {
    expect(normalizarTelefono('+51 987-654-321')).toBe('987654321')
    expect(normalizarTelefono('987654321')).toBe('987654321')
  })
})

describe('whatsappUrl', () => {
  it('arma el enlace con prefijo +51', () => {
    expect(whatsappUrl('987654321')).toBe('https://wa.me/51987654321')
  })
  it('codifica el mensaje opcional', () => {
    expect(whatsappUrl('987654321', 'Hola!')).toBe('https://wa.me/51987654321?text=Hola!')
  })
  it('devuelve null si el número no es válido', () => {
    expect(whatsappUrl('123')).toBeNull()
    expect(whatsappUrl('')).toBeNull()
  })
})

describe('esPlacaValida', () => {
  it('acepta 6 alfanuméricos con o sin guion', () => {
    expect(esPlacaValida('ABC-123')).toBe(true)
    expect(esPlacaValida('abc123')).toBe(true)
    expect(esPlacaValida('A1B234')).toBe(true)
  })
  it('rechaza formatos inválidos', () => {
    expect(esPlacaValida('')).toBe(false)
    expect(esPlacaValida('AB-12')).toBe(false)
    expect(esPlacaValida('ABCD-1234')).toBe(false)
  })
})
