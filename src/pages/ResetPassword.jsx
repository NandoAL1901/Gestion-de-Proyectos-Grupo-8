import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import s from './Login.module.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Al llegar desde el enlace del correo, Supabase crea una sesión de
    // recuperación. Confirmamos que exista para permitir el cambio.
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const actualizar = async () => {
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('No se pudo actualizar. El enlace pudo expirar; solicita uno nuevo.'); return }
    setOk(true)
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.logo}>
            <div className={s.logoBox}><Car size={18} color="white" /></div>
            <span className={s.logoText}>Carpool Ulima</span>
          </div>
          <h1 className={s.title}>Nueva contraseña</h1>
          <p className={s.subtitle}>Elige una contraseña para tu cuenta</p>
        </div>

        {ok ? (
          <div className={s.card}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <CheckCircle size={40} color="var(--accent)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>¡Contraseña actualizada!</div>
              <div style={{ fontSize: 13, color: 'var(--medium)' }}>Te llevamos al inicio de sesión...</div>
            </div>
          </div>
        ) : !ready ? (
          <div className={s.card}>
            <div className={s.alertWarning}>
              <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                Abre esta página desde el <strong>enlace que te llegó al correo</strong>. Si el enlace expiró,
                solicita uno nuevo.
              </div>
            </div>
            <button className={s.submitBtn} onClick={() => navigate('/recuperar')}>Solicitar nuevo enlace</button>
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
                <label className={s.label}>Nueva contraseña</label>
                <div className={s.passwordWrap}>
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Mínimo 6 caracteres"
                    className={`${s.input} ${s.inputPassword}`}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShow(v => !v)} className={s.eyeBtn}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={s.field}>
                <label className={s.label}>Confirmar contraseña</label>
                <input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && actualizar()}
                  placeholder="Repite la contraseña"
                  className={s.input}
                />
              </div>
              <button className={s.submitBtn} onClick={actualizar} disabled={loading}>
                {loading ? 'Guardando...' : <><Lock size={16} /> Guardar contraseña</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
