// Validaciones y utilidades de formato compartidas.
// Centralizadas aquí para no duplicar reglas entre Registro, Login y Dashboard.

export const DOMINIO_ULIMA = '@aloe.ulima.edu.pe'

/** Correo institucional válido de la Ulima (solo verifica el dominio). */
export const esCorreoUlima = (correo) =>
  typeof correo === 'string' && correo.trim().toLowerCase().endsWith(DOMINIO_ULIMA)

/**
 * Código de alumno: 8 dígitos, donde los primeros 4 son el año de ingreso
 * (2020 a 2026) y los otros 4 son numéricos. Ej: 20204353.
 */
export const esCodigoValido = (codigo) => /^202[0-6]\d{4}$/.test(String(codigo).trim())

/**
 * Correo institucional válido para registrarse: dominio @aloe.ulima.edu.pe y
 * cuyo usuario (antes del @) es un código válido (año 2020-2026 + 4 dígitos).
 */
export const esCorreoUlimaValido = (correo) => {
  const c = String(correo || '').trim().toLowerCase()
  if (!c.endsWith(DOMINIO_ULIMA)) return false
  const local = c.slice(0, -DOMINIO_ULIMA.length)
  return esCodigoValido(local)
}

/** Solo los dígitos de un texto. */
export const soloDigitos = (valor) => String(valor || '').replace(/\D/g, '')

/**
 * Celular peruano: 9 dígitos que empiezan en 9.
 * Acepta que el usuario escriba espacios, guiones o el prefijo +51 / 51.
 */
export const esTelefonoValido = (telefono) => {
  let d = soloDigitos(telefono)
  if (d.length === 11 && d.startsWith('51')) d = d.slice(2) // quita prefijo país
  return /^9\d{8}$/.test(d)
}

/** Normaliza a los 9 dígitos nacionales (sin prefijo país). */
export const normalizarTelefono = (telefono) => {
  let d = soloDigitos(telefono)
  if (d.length === 11 && d.startsWith('51')) d = d.slice(2)
  return d
}

/** URL de WhatsApp con prefijo Perú (+51). Devuelve null si el número no sirve. */
export const whatsappUrl = (telefono, mensaje) => {
  const d = normalizarTelefono(telefono)
  if (!/^9\d{8}$/.test(d)) return null
  const base = `https://wa.me/51${d}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}

/**
 * Placa peruana: 6 caracteres alfanuméricos (autos: 3 letras + 3 números),
 * con o sin guion. Lenient para no rechazar formatos válidos poco comunes.
 */
export const esPlacaValida = (placa) =>
  /^[A-Za-z0-9]{3}-?[A-Za-z0-9]{3}$/.test(String(placa).trim())
