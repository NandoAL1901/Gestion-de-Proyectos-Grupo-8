import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' },
  container: { width: '100%', maxWidth: '420px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--medium)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', padding: '0', marginBottom: '24px' },
  header: { marginBottom: '32px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' },
  logoBox: { width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'DM Serif Display, serif', fontSize: '20px' },
  title: { fontSize: '28px', marginBottom: '6px' },
  subtitle: { color: 'var(--medium)', fontSize: '14px', fontWeight: '300' },
  card: { background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '14px', color: 'var(--charcoal)', background: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--transition)' },
  alertError: { padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FEF2F2', color: '#B84040', border: '1px solid #FECACA' },
  alertWarning: { padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
  submitBtn: { width: '100%', padding: '14px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', transition: 'opacity var(--transition)' },
  registerBtn: { width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' },
  linkBtn: { color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium)', display: 'flex', padding: 0 },
}

// Tipos de error para mostrar mensajes distintos
const ERRORS = {
  NO_EMAIL: 'no-email',
  INVALID_EMAIL: 'invalid-email',
  NO_PASSWORD: 'no-password',
  NOT_FOUND: 'not-found',       // correo no registrado
  WRONG_PASSWORD: 'wrong-pass', // contraseña incorrecta
  NOT_CONFIRMED: 'not-confirmed',
  NO_PROFILE: 'no-profile',
  CONNECTION: 'connection',
}

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorType, setErrorType] = useState(null)

  const setError = (type) => setErrorType(type)
  const clearError = () => setErrorType(null)

  const handleLogin = async () => {
    const email = correo.trim().toLowerCase()

    // Validaciones locales
    if (!email) { setError(ERRORS.NO_EMAIL); return }
    if (!email.endsWith('@aloe.ulima.edu.pe')) { setError(ERRORS.INVALID_EMAIL); return }
    if (!password) { setError(ERRORS.NO_PASSWORD); return }

    setLoading(true)
    clearError()

    try {
      // 1. Verificar si el correo existe en la plataforma (sin necesitar auth)
      const { data: existe, error: rpcError } = await supabase.rpc('email_registrado', { p_correo: email })

      if (!rpcError && existe === false) {
        setError(ERRORS.NOT_FOUND)
        return
      }

      // 2. Intentar autenticación con email + contraseña
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError(ERRORS.NOT_CONFIRMED)
        } else {
          setError(ERRORS.WRONG_PASSWORD)
        }
        return
      }

      // 3. Obtener perfil del usuario
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .eq('activo', true)
        .single()

      if (!perfil) {
        await supabase.auth.signOut()
        setError(ERRORS.NO_PROFILE)
        return
      }

      onLogin(perfil)
      navigate('/dashboard')
    } catch {
      setError(ERRORS.CONNECTION)
    } finally {
      setLoading(false)
    }
  }

  const renderAlert = () => {
    if (!errorType) return null

    // Correo no registrado → aviso especial con botón de registro
    if (errorType === ERRORS.NOT_FOUND) {
      return (
        <div style={styles.alertWarning}>
          <UserX size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>No encontramos esta cuenta</div>
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
              El correo <strong>{correo}</strong> no está registrado en Carpool Ulima.
            </div>
            <button
              onClick={() => navigate('/registro')}
              style={{ background: '#92400E', color: 'white', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Crear cuenta ahora
            </button>
          </div>
        </div>
      )
    }

    // Mensajes de error estándar
    const messages = {
      [ERRORS.NO_EMAIL]: 'Ingresa tu correo institucional.',
      [ERRORS.INVALID_EMAIL]: 'Debes usar tu correo @aloe.ulima.edu.pe.',
      [ERRORS.NO_PASSWORD]: 'Ingresa tu contraseña.',
      [ERRORS.WRONG_PASSWORD]: 'Contraseña incorrecta. Verifica e intenta de nuevo.',
      [ERRORS.NOT_CONFIRMED]: 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.',
      [ERRORS.NO_PROFILE]: 'No encontramos tu perfil de usuario. Contacta al administrador.',
      [ERRORS.CONNECTION]: 'Error de conexión. Verifica tu red e intenta de nuevo.',
    }

    return (
      <div style={styles.alertError}>
        <AlertCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
        {messages[errorType] || 'Ocurrió un error inesperado.'}
      </div>
    )
  }

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
          <h1 style={styles.title}>Iniciar sesión</h1>
          <p style={styles.subtitle}>Ingresa con tu correo y contraseña</p>
        </div>

        {renderAlert()}

        <div style={styles.card}>
          <div style={styles.field}>
            <label style={styles.label}>Correo institucional</label>
            <input
              type="email"
              value={correo}
              onChange={e => { setCorreo(e.target.value); clearError() }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="codigo@aloe.ulima.edu.pe"
              style={{
                ...styles.input,
                borderColor: errorType === ERRORS.NO_EMAIL || errorType === ERRORS.INVALID_EMAIL ? 'var(--error)' : 'var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Tu contraseña"
                style={{
                  ...styles.input,
                  paddingRight: '44px',
                  borderColor: errorType === ERRORS.WRONG_PASSWORD || errorType === ERRORS.NO_PASSWORD ? 'var(--error)' : 'var(--border)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Verificando...' : <><LogIn size={16} /> Ingresar</>}
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--medium)' }}>
          ¿Aún no tienes cuenta?{' '}
          <button style={styles.linkBtn} onClick={() => navigate('/registro')}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}
