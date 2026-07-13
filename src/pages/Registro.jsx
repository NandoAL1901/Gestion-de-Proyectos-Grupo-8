import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Car, User, CheckCircle, AlertCircle, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DISTRITOS, CARRERAS, HORARIOS } from '../lib/constants'
import { esCorreoUlimaValido, esCodigoValido, esTelefonoValido, normalizarTelefono, esPlacaValida } from '../lib/validation'
import s from './Registro.module.css'

const F = ({ name, label, required, type = 'text', hint, placeholder, form, fieldErrors, set }) => (
  <div className={s.field}>
    <label className={s.label}>{label} {required && <span className={s.labelRequired}>*</span>}</label>
    <input
      type={type}
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      placeholder={placeholder}
      className={fieldErrors[name] ? `${s.input} ${s.inputError}` : s.input}
    />
    {hint && !fieldErrors[name] && <div className={s.inputHint}>{hint}</div>}
    {fieldErrors[name] && <div className={s.errorMsg}><AlertCircle size={11} />{fieldErrors[name]}</div>}
  </div>
)

const Sel = ({ name, label, required, options, placeholder, form, fieldErrors, set }) => (
  <div className={s.field}>
    <label className={s.label}>{label} {required && <span className={s.labelRequired}>*</span>}</label>
    <select
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      className={fieldErrors[name] ? `${s.input} ${s.select} ${s.inputError}` : `${s.input} ${s.select}`}
    >
      <option value="">{placeholder || 'Seleccionar...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {fieldErrors[name] && <div className={s.errorMsg}><AlertCircle size={11} />{fieldErrors[name]}</div>}
  </div>
)

const PasswordField = ({ label, value, onChange, error, show, onToggle }) => (
  <div className={s.field}>
    <label className={s.label}>{label} <span className={s.labelRequired}>*</span></label>
    <div className={s.passwordWrap}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Mínimo 6 caracteres"
        className={`${s.input} ${s.inputPassword}${error ? ' ' + s.inputError : ''}`}
      />
      <button type="button" onClick={onToggle} className={s.eyeBtn}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <div className={s.errorMsg}><AlertCircle size={11} />{error}</div>}
  </div>
)

export default function Registro({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tipoUsuario, setTipoUsuario] = useState(searchParams.get('tipo') === 'conductor' ? 'conductor' : 'pasajero')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    nombre_completo: '',
    correo: '',
    password: '',
    confirmPassword: '',
    codigo_ulima: '',
    telefono: '',
    carrera: '',
    distrito: '',
    horario_entrada: '',
    horario_salida: '',
    modelo_auto: '',
    placa_auto: '',
    asientos_disponibles: '',
  })

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setFieldErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre_completo.trim()) e.nombre_completo = 'El nombre es obligatorio'
    if (!esCorreoUlimaValido(form.correo)) e.correo = 'Tu correo debe ser tu código (año 2020–2026 + 4 dígitos) @aloe.ulima.edu.pe'
    if (!form.password || form.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!esCodigoValido(form.codigo_ulima)) e.codigo_ulima = 'El código debe tener 8 dígitos y empezar con tu año de ingreso (2020–2026)'
    if (!esTelefonoValido(form.telefono)) e.telefono = 'Ingresa un celular peruano válido (9 dígitos, empieza en 9)'
    if (!form.carrera) e.carrera = 'Selecciona tu carrera'
    if (!form.distrito) e.distrito = 'Selecciona tu distrito'
    if (!form.horario_entrada) e.horario_entrada = 'Selecciona tu horario de entrada'
    if (tipoUsuario === 'conductor') {
      if (!form.modelo_auto.trim()) e.modelo_auto = 'Ingresa el modelo de tu auto'
      if (!esPlacaValida(form.placa_auto)) e.placa_auto = 'Placa inválida (ej: ABC-123)'
      const asientos = parseInt(form.asientos_disponibles, 10)
      if (!asientos || asientos < 1 || asientos > 6) e.asientos_disponibles = 'Entre 1 y 6 asientos'
    }
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    try {
      // 0. Verificar que el código de alumno no esté tomado ANTES de crear
      //    la cuenta de Auth. Así evitamos cuentas huérfanas (Auth creado
      //    pero perfil rechazado por código duplicado).
      const { data: codigoTomado, error: codigoError } = await supabase.rpc('codigo_registrado', { p_codigo: form.codigo_ulima.trim() })
      if (!codigoError && codigoTomado === true) {
        setFieldErrors(p => ({ ...p, codigo_ulima: 'Este código de alumno ya está registrado' }))
        return
      }

      // 1. Crear usuario en Supabase Auth (email + contraseña)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo.trim().toLowerCase(),
        password: form.password,
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          setApiError('Este correo ya tiene una cuenta registrada.')
        } else {
          setApiError('Error al crear la cuenta: ' + authError.message)
        }
        return
      }

      if (!authData.user) {
        setApiError('No se pudo crear la cuenta. Intenta de nuevo.')
        return
      }

      // 2. Insertar perfil vinculado al ID de auth
      const payload = {
        id: authData.user.id,
        nombre_completo: form.nombre_completo.trim(),
        correo: form.correo.trim().toLowerCase(),
        codigo_ulima: form.codigo_ulima.trim(),
        telefono: normalizarTelefono(form.telefono),
        carrera: form.carrera,
        distrito: form.distrito,
        tipo_usuario: tipoUsuario,
        horario_entrada: form.horario_entrada,
        horario_salida: form.horario_salida || null,
        ...(tipoUsuario === 'conductor' && {
          modelo_auto: form.modelo_auto.trim(),
          placa_auto: form.placa_auto.trim().toUpperCase(),
          asientos_disponibles: parseInt(form.asientos_disponibles),
        }),
      }

      const { data, error } = await supabase.from('usuarios').insert([payload]).select().single()

      if (error) {
        // El perfil no se pudo guardar: cerramos la sesión recién creada para
        // no dejar al usuario en un estado a medias (Auth sin perfil).
        await supabase.auth.signOut()
        if (error.code === '23505') {
          if (error.message.includes('correo')) setApiError('Este correo ya está registrado.')
          else if (error.message.includes('codigo')) setApiError('Este código de alumno ya está registrado.')
          else setApiError('Ya existe un registro con estos datos.')
        } else {
          setApiError('No se pudo guardar tu perfil: ' + error.message + '. Vuelve a intentarlo.')
        }
        return
      }

      onLogin(data)
      navigate('/dashboard')
    } catch {
      setApiError('Error de conexión. Verifica tu configuración de Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const fieldProps = { form, fieldErrors, set }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <button className={s.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={15} /> Volver al inicio
        </button>

        <div className={s.header}>
          <div className={s.logo}>
            <div className={s.logoBox}><Car size={18} color="white" /></div>
            <span className={s.logoText}>Carpool Ulima</span>
          </div>
          <h1 className={s.title}>Crear cuenta</h1>
          <p className={s.subtitle}>Solo para estudiantes de la Universidad de Lima</p>
        </div>

        {apiError && (
          <div className={s.alert}>
            <AlertCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
            {apiError}
          </div>
        )}

        {/* Tipo de usuario */}
        <div className={s.card}>
          <div className={s.sectionTitle}>¿Cómo participas?</div>
          <div className={s.typeSwitch}>
            <button onClick={() => setTipoUsuario('pasajero')} className={tipoUsuario === 'pasajero' ? `${s.typeBtn} ${s.typeBtnActive}` : s.typeBtn}>
              <User size={20} color={tipoUsuario === 'pasajero' ? 'var(--accent)' : 'var(--medium)'} />
              <span>Pasajero</span>
              <span className={s.typeBtnSub}>Necesito carpool</span>
            </button>
            <button onClick={() => setTipoUsuario('conductor')} className={tipoUsuario === 'conductor' ? `${s.typeBtn} ${s.typeBtnActive}` : s.typeBtn}>
              <Car size={20} color={tipoUsuario === 'conductor' ? 'var(--accent)' : 'var(--medium)'} />
              <span>Conductor</span>
              <span className={s.typeBtnSub}>Ofrezco mi auto</span>
            </button>
          </div>
        </div>

        {/* Datos personales */}
        <div className={s.card}>
          <div className={s.sectionTitle}>Datos personales</div>
          <F name="nombre_completo" label="Nombre completo" required placeholder="Ej: Ana García Torres" {...fieldProps} />
          <F name="correo" label="Correo institucional" required type="email" placeholder="20234567@aloe.ulima.edu.pe" hint="Tu código (año 2020–2026 + 4 dígitos) @aloe.ulima.edu.pe" {...fieldProps} />
          <PasswordField
            label="Contraseña"
            value={form.password}
            onChange={v => set('password', v)}
            error={fieldErrors.password}
            show={showPassword}
            onToggle={() => setShowPassword(p => !p)}
          />
          <PasswordField
            label="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={v => set('confirmPassword', v)}
            error={fieldErrors.confirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(p => !p)}
          />
          <F name="codigo_ulima" label="Código de alumno" required placeholder="20234567" hint="8 dígitos: año de ingreso (2020–2026) + 4 dígitos" type="text" {...fieldProps} />
          <F name="telefono" label="Número de celular" required placeholder="Ej: 987654321" hint="Tu número para coordinar via WhatsApp" type="tel" {...fieldProps} />
          <Sel name="carrera" label="Carrera" required options={CARRERAS} placeholder="Selecciona tu carrera..." {...fieldProps} />
        </div>

        {/* Ubicación y horario */}
        <div className={s.card}>
          <div className={s.sectionTitle}>Ubicación y horario</div>
          <Sel name="distrito" label="Distrito de residencia" required options={DISTRITOS} placeholder="Selecciona tu distrito..." {...fieldProps} />
          <div className={s.fieldRow}>
            <Sel name="horario_entrada" label="Hora de entrada" required options={HORARIOS} placeholder="Hora..." {...fieldProps} />
            <Sel name="horario_salida" label="Hora de salida" options={HORARIOS} placeholder="Hora..." {...fieldProps} />
          </div>
          <div className={s.matchingHint}>
            💡 El matching se basa en tu distrito. Solo verás compañeros de tu misma zona.
          </div>
        </div>

        {/* Datos del auto */}
        {tipoUsuario === 'conductor' && (
          <div className={s.card}>
            <div className={s.sectionTitle}>Datos del vehículo</div>
            <F name="modelo_auto" label="Marca y modelo" required placeholder="Ej: Toyota Corolla 2020" {...fieldProps} />
            <div className={s.fieldRow}>
              <F name="placa_auto" label="Placa" required placeholder="Ej: ABC-123" {...fieldProps} />
              <div className={s.field}>
                <label className={s.label}>Asientos disponibles <span className={s.labelRequired}>*</span></label>
                <input
                  type="number" min="1" max="6"
                  value={form.asientos_disponibles}
                  onChange={e => set('asientos_disponibles', e.target.value)}
                  placeholder="1–6"
                  className={fieldErrors.asientos_disponibles ? `${s.input} ${s.inputError}` : s.input}
                />
                {fieldErrors.asientos_disponibles && <div className={s.errorMsg}><AlertCircle size={11} />{fieldErrors.asientos_disponibles}</div>}
              </div>
            </div>
          </div>
        )}

        <button className={s.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando cuenta...' : <><CheckCircle size={16} /> Crear mi cuenta <ChevronRight size={16} /></>}
        </button>

        <div className={s.consent}>
          Al registrarte aceptas que tu número de teléfono podrá ser utilizado para coordinación de grupos de carpool.
        </div>

        <div className={s.footerText}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} className={s.linkBtn}>
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  )
}
