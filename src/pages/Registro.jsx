import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Car, User, CheckCircle, AlertCircle, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DISTRITOS, CARRERAS, HORARIOS } from '../lib/constants'

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' },
  container: { width: '100%', maxWidth: '520px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--medium)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '0', marginBottom: '24px' },
  header: { marginBottom: '32px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' },
  logoBox: { width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'DM Serif Display, serif', fontSize: '20px' },
  title: { fontSize: '28px', marginBottom: '6px' },
  subtitle: { color: 'var(--medium)', fontSize: '14px', fontWeight: '300' },
  card: { background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--medium)', marginBottom: '16px' },
  typeSwitch: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' },
  typeBtn: { padding: '14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all var(--transition)', fontSize: '13px', fontWeight: '500' },
  typeBtnActive: { borderColor: 'var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '6px' },
  labelRequired: { color: 'var(--error)', marginLeft: '2px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '14px', color: 'var(--charcoal)', background: 'white', outline: 'none', transition: 'border-color var(--transition)', boxSizing: 'border-box' },
  inputError: { borderColor: 'var(--error)' },
  inputHint: { fontSize: '11px', color: 'var(--medium)', marginTop: '4px' },
  errorMsg: { fontSize: '11px', color: 'var(--error)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  submitBtn: { width: '100%', padding: '14px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity var(--transition)', marginTop: '8px' },
  alert: { padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', color: '#B84040', border: '1px solid #FECACA' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium)', display: 'flex', padding: 0 },
}

const F = ({ name, label, required, type = 'text', hint, placeholder, form, fieldErrors, set }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label} {required && <span style={styles.labelRequired}>*</span>}</label>
    <input
      type={type}
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      placeholder={placeholder}
      style={{ ...styles.input, ...(fieldErrors[name] ? styles.inputError : {}) }}
      onFocus={e => e.target.style.borderColor = fieldErrors[name] ? 'var(--error)' : 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = fieldErrors[name] ? 'var(--error)' : 'var(--border)'}
    />
    {hint && !fieldErrors[name] && <div style={styles.inputHint}>{hint}</div>}
    {fieldErrors[name] && <div style={styles.errorMsg}><AlertCircle size={11} />{fieldErrors[name]}</div>}
  </div>
)

const Sel = ({ name, label, required, options, placeholder, form, fieldErrors, set }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label} {required && <span style={styles.labelRequired}>*</span>}</label>
    <select
      value={form[name]}
      onChange={e => set(name, e.target.value)}
      style={{ ...styles.input, ...(fieldErrors[name] ? styles.inputError : {}), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B67' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px' }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = fieldErrors[name] ? 'var(--error)' : 'var(--border)'}
    >
      <option value="">{placeholder || 'Seleccionar...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {fieldErrors[name] && <div style={styles.errorMsg}><AlertCircle size={11} />{fieldErrors[name]}</div>}
  </div>
)

const PasswordField = ({ label, value, onChange, error, show, onToggle }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label} <span style={styles.labelRequired}>*</span></label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Mínimo 6 caracteres"
        style={{ ...styles.input, paddingRight: '44px', ...(error ? styles.inputError : {}) }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--error)' : 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'}
      />
      <button type="button" onClick={onToggle} style={styles.eyeBtn}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <div style={styles.errorMsg}><AlertCircle size={11} />{error}</div>}
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
    if (!form.correo.endsWith('@aloe.ulima.edu.pe')) e.correo = 'Debes usar tu correo @aloe.ulima.edu.pe'
    if (!form.password || form.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!/^\d{8}$/.test(form.codigo_ulima)) e.codigo_ulima = 'El código debe tener exactamente 8 dígitos numéricos'
    if (!form.telefono.trim() || form.telefono.replace(/\D/g, '').length < 9) e.telefono = 'Ingresa un número válido (mínimo 9 dígitos)'
    if (!form.carrera) e.carrera = 'Selecciona tu carrera'
    if (!form.distrito) e.distrito = 'Selecciona tu distrito'
    if (!form.horario_entrada) e.horario_entrada = 'Selecciona tu horario de entrada'
    if (tipoUsuario === 'conductor') {
      if (!form.modelo_auto.trim()) e.modelo_auto = 'Ingresa el modelo de tu auto'
      if (!form.placa_auto.trim()) e.placa_auto = 'Ingresa la placa de tu auto'
      if (!form.asientos_disponibles || form.asientos_disponibles < 1 || form.asientos_disponibles > 6) e.asientos_disponibles = 'Entre 1 y 6 asientos'
    }
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    try {
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
        telefono: form.telefono.trim(),
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
        if (error.code === '23505') {
          if (error.message.includes('correo')) setApiError('Este correo ya está registrado.')
          else if (error.message.includes('codigo')) setApiError('Este código de alumno ya está registrado.')
          else setApiError('Ya existe un registro con estos datos.')
        } else {
          setApiError('Error al guardar perfil: ' + error.message)
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
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={15} /> Volver al inicio
        </button>

        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoBox}><Car size={18} color="white" /></div>
            <span style={styles.logoText}>Carpool Ulima</span>
          </div>
          <h1 style={styles.title}>Crear cuenta</h1>
          <p style={styles.subtitle}>Solo para estudiantes de la Universidad de Lima</p>
        </div>

        {apiError && (
          <div style={styles.alert}>
            <AlertCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
            {apiError}
          </div>
        )}

        {/* Tipo de usuario */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>¿Cómo participas?</div>
          <div style={styles.typeSwitch}>
            <button onClick={() => setTipoUsuario('pasajero')} style={{ ...styles.typeBtn, ...(tipoUsuario === 'pasajero' ? styles.typeBtnActive : {}) }}>
              <User size={20} color={tipoUsuario === 'pasajero' ? 'var(--accent)' : 'var(--medium)'} />
              <span>Pasajero</span>
              <span style={{ fontSize: '11px', color: 'var(--medium)', fontWeight: '400' }}>Necesito carpool</span>
            </button>
            <button onClick={() => setTipoUsuario('conductor')} style={{ ...styles.typeBtn, ...(tipoUsuario === 'conductor' ? styles.typeBtnActive : {}) }}>
              <Car size={20} color={tipoUsuario === 'conductor' ? 'var(--accent)' : 'var(--medium)'} />
              <span>Conductor</span>
              <span style={{ fontSize: '11px', color: 'var(--medium)', fontWeight: '400' }}>Ofrezco mi auto</span>
            </button>
          </div>
        </div>

        {/* Datos personales */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Datos personales</div>
          <F name="nombre_completo" label="Nombre completo" required placeholder="Ej: Ana García Torres" {...fieldProps} />
          <F name="correo" label="Correo institucional" required type="email" placeholder="codigo@aloe.ulima.edu.pe" hint="Debe ser tu correo @aloe.ulima.edu.pe" {...fieldProps} />
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
          <F name="codigo_ulima" label="Código de alumno" required placeholder="12345678" hint="8 dígitos numéricos de tu código universitario" type="text" {...fieldProps} />
          <F name="telefono" label="Número de celular" required placeholder="Ej: 987654321" hint="Tu número para coordinar via WhatsApp" type="tel" {...fieldProps} />
          <Sel name="carrera" label="Carrera" required options={CARRERAS} placeholder="Selecciona tu carrera..." {...fieldProps} />
        </div>

        {/* Ubicación y horario */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Ubicación y horario</div>
          <Sel name="distrito" label="Distrito de residencia" required options={DISTRITOS} placeholder="Selecciona tu distrito..." {...fieldProps} />
          <div style={styles.fieldRow}>
            <Sel name="horario_entrada" label="Hora de entrada" required options={HORARIOS} placeholder="Hora..." {...fieldProps} />
            <Sel name="horario_salida" label="Hora de salida" options={HORARIOS} placeholder="Hora..." {...fieldProps} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--medium)', marginTop: '-4px', padding: '10px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)' }}>
            💡 El matching se basa en tu distrito. Solo verás compañeros de tu misma zona.
          </div>
        </div>

        {/* Datos del auto */}
        {tipoUsuario === 'conductor' && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Datos del vehículo</div>
            <F name="modelo_auto" label="Marca y modelo" required placeholder="Ej: Toyota Corolla 2020" {...fieldProps} />
            <div style={styles.fieldRow}>
              <F name="placa_auto" label="Placa" required placeholder="Ej: ABC-123" {...fieldProps} />
              <div style={styles.field}>
                <label style={styles.label}>Asientos disponibles <span style={styles.labelRequired}>*</span></label>
                <input
                  type="number" min="1" max="6"
                  value={form.asientos_disponibles}
                  onChange={e => set('asientos_disponibles', e.target.value)}
                  placeholder="1–6"
                  style={{ ...styles.input, ...(fieldErrors.asientos_disponibles ? styles.inputError : {}) }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = fieldErrors.asientos_disponibles ? 'var(--error)' : 'var(--border)'}
                />
                {fieldErrors.asientos_disponibles && <div style={styles.errorMsg}><AlertCircle size={11} />{fieldErrors.asientos_disponibles}</div>}
              </div>
            </div>
          </div>
        )}

        <button style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando cuenta...' : <><CheckCircle size={16} /> Crear mi cuenta <ChevronRight size={16} /></>}
        </button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--medium)', marginTop: '16px', lineHeight: '1.6', padding: '0 8px' }}>
          Al registrarte aceptas que tu número de teléfono podrá ser utilizado para coordinación de grupos de carpool.
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--medium)', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 }}>
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  )
}
