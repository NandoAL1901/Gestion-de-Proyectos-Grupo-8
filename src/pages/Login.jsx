import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { esCorreoUlima } from '../lib/validation'
import s from './Login.module.css'

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
    if (!esCorreoUlima(email)) { setError(ERRORS.INVALID_EMAIL); return }
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
        <div className={s.alertWarning}>
          <UserX size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
          <div>
            <div className={s.warningBox}>No encontramos esta cuenta</div>
            <div className={s.warningText}>
              El correo <strong>{correo}</strong> no está registrado en Carpool Ulima.
            </div>
            <button onClick={() => navigate('/registro')} className={s.warningBtn}>
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
      <div className={s.alertError}>
        <AlertCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} />
        {messages[errorType] || 'Ocurrió un error inesperado.'}
      </div>
    )
  }

  const emailError = errorType === ERRORS.NO_EMAIL || errorType === ERRORS.INVALID_EMAIL
  const passwordError = errorType === ERRORS.WRONG_PASSWORD || errorType === ERRORS.NO_PASSWORD

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
          <h1 className={s.title}>Iniciar sesión</h1>
          <p className={s.subtitle}>Ingresa con tu correo y contraseña</p>
        </div>

        {renderAlert()}

        <div className={s.card}>
          <div className={s.field}>
            <label className={s.label}>Correo institucional</label>
            <input
              type="email"
              value={correo}
              onChange={e => { setCorreo(e.target.value); clearError() }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="codigo@aloe.ulima.edu.pe"
              className={emailError ? `${s.input} ${s.inputError}` : s.input}
              autoFocus
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Contraseña</label>
            <div className={s.passwordWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Tu contraseña"
                className={`${s.input} ${s.inputPassword}${passwordError ? ' ' + s.inputError : ''}`}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className={s.eyeBtn}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className={s.submitBtn} onClick={handleLogin} disabled={loading}>
            {loading ? 'Verificando...' : <><LogIn size={16} /> Ingresar</>}
          </button>
        </div>

        <div className={s.footerText}>
          ¿Aún no tienes cuenta?{' '}
          <button className={s.linkBtn} onClick={() => navigate('/registro')}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}
