import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, ArrowLeft, AlertCircle, CheckCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { esCorreoUlima } from '../lib/validation'
import s from './Login.module.css'

export default function RecuperarPassword() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const enviar = async () => {
    const email = correo.trim().toLowerCase()
    if (!esCorreoUlima(email)) { setError('Usa tu correo @aloe.ulima.edu.pe'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError('No se pudo enviar el correo. Espera un momento e intenta de nuevo.'); return }
    setSent(true)
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <button className={s.backBtn} onClick={() => navigate('/login')}>
          <ArrowLeft size={15} /> Volver al inicio de sesión
        </button>

        <div className={s.header}>
          <div className={s.logo}>
            <div className={s.logoBox}><Car size={18} color="white" /></div>
            <span className={s.logoText}>Carpool Ulima</span>
          </div>
          <h1 className={s.title}>Recuperar contraseña</h1>
          <p className={s.subtitle}>Te enviaremos un enlace para restablecerla</p>
        </div>

        {sent ? (
          <div className={s.card}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <CheckCircle size={40} color="var(--accent)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Revisa tu correo</div>
              <div style={{ fontSize: 13, color: 'var(--medium)', lineHeight: 1.6 }}>
                Si <strong>{correo}</strong> tiene una cuenta, te llegó un enlace para crear una nueva contraseña.
                Revisa también la carpeta de <strong>spam</strong>.
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className={s.alertError}>
                <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                {error}
              </div>
            )}
            <div className={s.card}>
              <div className={s.field}>
                <label className={s.label}>Correo institucional</label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => { setCorreo(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && enviar()}
                  placeholder="codigo@aloe.ulima.edu.pe"
                  className={s.input}
                  autoFocus
                />
              </div>
              <button className={s.submitBtn} onClick={enviar} disabled={loading}>
                {loading ? 'Enviando...' : <><Send size={16} /> Enviar enlace</>}
              </button>
            </div>
          </>
        )}

        <div className={s.footerText}>
          ¿Recordaste tu contraseña?{' '}
          <button className={s.linkBtn} onClick={() => navigate('/login')}>Inicia sesión</button>
        </div>
      </div>
    </div>
  )
}
