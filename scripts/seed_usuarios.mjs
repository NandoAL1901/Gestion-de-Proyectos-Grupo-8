// ============================================================
// Carpool Ulima - Seed de 209 usuarios de prueba (91% pasajeros / 9% conductores)
// Crea cuentas de Auth reales (confirmadas) + su perfil en `usuarios`.
//
// Uso (Windows PowerShell), desde la carpeta del proyecto:
//   $env:SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"; node scripts/seed_usuarios.mjs
//
// La service_role key está en: Supabase → Project Settings → API → service_role (secret).
// ⚠️ Es SECRETA: no la pegues en chats ni la subas a git. El script la lee de la
//    variable de entorno; la URL la toma de tu archivo .env.
//
// Todos los usuarios comparten la contraseña definida en PASSWORD (para demo).
// Se marcan con user_metadata { seed: true } para poder limpiarlos luego (ver README abajo).
// ============================================================
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// --- Config ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .replace(/\r/g, '')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PASSWORD = 'CarpoolUlima2026'

if (!SUPABASE_URL) { console.error('No encontré VITE_SUPABASE_URL en .env'); process.exit(1) }
if (!SERVICE_KEY) { console.error('Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

// --- Distribución por distrito: [distrito, pasajeros, conductores] ---
const DISTRIB = [
  ['Lince', 36, 3],
  ['Villa María del Triunfo', 41, 4],
  ['Jesús María', 37, 4],
  ['La Molina', 37, 4],
  ['Santiago de Surco', 39, 4],
]

// --- Pools de datos aleatorios ---
const PN = ['Ana', 'Luis', 'María', 'José', 'Carla', 'Jorge', 'Lucía', 'Diego', 'Sofía', 'Miguel', 'Valeria', 'Andrés', 'Camila', 'Fernando', 'Daniela', 'Gabriel', 'Paola', 'Ricardo', 'Andrea', 'Sebastián', 'Rosa', 'Carlos', 'Elena', 'Manuel', 'Isabel', 'Fabrizio', 'Claudia', 'Renzo', 'Patricia', 'Alonso']
const AN = ['García', 'Rodríguez', 'Martínez', 'López', 'Gonzáles', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Díaz', 'Vásquez', 'Castillo', 'Rojas', 'Mendoza', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos', 'Herrera', 'Medina', 'Aguilar', 'Vargas', 'Campos', 'Núñez', 'Salazar', 'Paredes']
const CARR = ['Administración', 'Arquitectura', 'Comunicación', 'Contabilidad y Finanzas', 'Derecho', 'Economía', 'Ingeniería Ambiental', 'Ingeniería Civil', 'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Mecatrónica', 'Marketing', 'Negocios Internacionales', 'Psicología']
const HENT = ['7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '2:00 pm', '4:00 pm']
const HSAL = ['1:00 pm', '3:00 pm', '5:00 pm', '7:00 pm', '9:00 pm', '10:00 pm']
const AUTOS = ['Toyota Corolla', 'Kia Rio', 'Hyundai Accent', 'Nissan Sentra', 'Volkswagen Gol', 'Chevrolet Sail', 'Suzuki Swift', 'Toyota Yaris']

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const telefono = () => '9' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0')
const placa = () => { const L = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); return `${L()}${L()}${L()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}` }

async function main() {
  // Códigos ya usados (para no chocar con alumnos reales)
  const { data: existentes, error } = await supabase.from('usuarios').select('codigo_ulima')
  if (error) { console.error('No pude leer códigos existentes:', error.message); process.exit(1) }
  const usados = new Set((existentes || []).map(u => u.codigo_ulima))
  const nuevoCodigo = () => {
    let c
    do { const yr = 2020 + Math.floor(Math.random() * 7); c = String(yr * 10000 + Math.floor(Math.random() * 10000)) } while (usados.has(c))
    usados.add(c)
    return c
  }

  // Lista de usuarios a crear
  const lista = []
  for (const [distrito, nPas, nCond] of DISTRIB) {
    for (let i = 0; i < nPas; i++) lista.push({ distrito, tipo: 'pasajero' })
    for (let i = 0; i < nCond; i++) lista.push({ distrito, tipo: 'conductor' })
  }

  console.log(`Creando ${lista.length} usuarios...`)
  let ok = 0, fail = 0
  for (const u of lista) {
    const codigo = nuevoCodigo()
    const correo = `${codigo}@aloe.ulima.edu.pe`

    const { data: created, error: e1 } = await supabase.auth.admin.createUser({
      email: correo,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { seed: true },
    })
    if (e1) { console.error('  ✗ auth', correo, e1.message); fail++; continue }

    const esCond = u.tipo === 'conductor'
    const perfil = {
      id: created.user.id,
      codigo_ulima: codigo,
      nombre_completo: `${pick(PN)} ${pick(AN)} ${pick(AN)}`,
      correo,
      telefono: telefono(),
      carrera: pick(CARR),
      distrito: u.distrito,
      tipo_usuario: u.tipo,
      horario_entrada: pick(HENT),
      horario_salida: Math.random() < 0.6 ? pick(HSAL) : null,
      mostrar_telefono: Math.random() < 0.85,
      activo: true,
      ...(esCond ? {
        modelo_auto: `${pick(AUTOS)} ${2015 + Math.floor(Math.random() * 9)}`,
        placa_auto: placa(),
        asientos_disponibles: 1 + Math.floor(Math.random() * 4),
      } : {}),
    }

    const { error: e2 } = await supabase.from('usuarios').insert(perfil)
    if (e2) {
      // Si el perfil falla, borra la cuenta de Auth para no dejar huérfanos
      await supabase.auth.admin.deleteUser(created.user.id)
      console.error('  ✗ perfil', correo, e2.message); fail++; continue
    }
    ok++
    if (ok % 25 === 0) console.log(`  ${ok} creados...`)
  }

  console.log(`\nListo. ${ok} usuarios creados, ${fail} fallos.`)
  console.log(`Contraseña de todos (para demo): ${PASSWORD}`)
}

main().catch(e => { console.error(e); process.exit(1) })
