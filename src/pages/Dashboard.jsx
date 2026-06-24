import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, MapPin, Phone, ArrowRight, CheckCircle, Edit2, X, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DISTRITOS, CARRERAS, HORARIOS } from '../lib/constants'

const s = {
  page: { minHeight: 'calc(100vh - 60px)', background: 'var(--cream)', padding: '32px 16px 60px' },
  inner: { maxWidth: '900px', margin: '0 auto' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' },
  greetingSmall: { fontSize: '13px', color: 'var(--medium)', marginBottom: '4px' },
  greetingName: { fontSize: '28px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 18px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'white',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: 'var(--charcoal)',
    transition: 'all var(--transition)',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' },
  statCard: { background: 'white', borderRadius: 'var(--radius)', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' },
  statLabel: { fontSize: '12px', color: 'var(--medium)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { fontSize: '26px', fontFamily: 'DM Serif Display, serif', color: 'var(--charcoal)' },
  statSub: { fontSize: '12px', color: 'var(--medium)', marginTop: '2px' },
  ctaCard: {
    background: 'var(--charcoal)', borderRadius: 'var(--radius)', padding: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px', marginBottom: '20px', flexWrap: 'wrap',
  },
  ctaBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--accent)', color: 'white', padding: '12px 22px',
    borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  sectionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  card: { background: 'white', borderRadius: 'var(--radius)', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' },
  cardTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  profileLabel: { color: 'var(--medium)' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  badgeConductor: { background: '#E8F5EF', color: 'var(--accent)' },
  badgePasajero: { background: '#EFF6FF', color: '#2563EB' },
  dangerCard: { background: '#FEF2F2', borderRadius: 'var(--radius)', padding: '24px', border: '1px solid #FECACA' },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginTop: '20px' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalBody: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' },

  // Form
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--charcoal)', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '14px', color: 'var(--charcoal)', background: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--transition)' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: '14px', color: 'var(--charcoal)', background: 'white', outline: 'none', boxSizing: 'border-box', appearance: 'none' },
  sectionLabel: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--medium)', marginBottom: '12px', marginTop: '20px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', background: 'var(--charcoal)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  cancelBtn: { padding: '10px 18px', background: 'transparent', color: 'var(--medium)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium)', display: 'flex', alignItems: 'center', padding: '4px' },
  alertMsg: { padding: '10px 14px', background: '#FEF2F2', color: '#B84040', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '16px', border: '1px solid #FECACA' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' },
}

export default function Dashboard({ usuario, onUpdate, onLogout }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, conductores: 0, pasajeros: 0, matches: 0 })
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  useEffect(() => {
    supabase.from('usuarios').select('tipo_usuario, distrito').eq('activo', true)
      .then(({ data }) => {
        if (!data) return
        const conductores = data.filter(u => u.tipo_usuario === 'conductor').length
        const pasajeros = data.filter(u => u.tipo_usuario === 'pasajero').length
        const matches = data.filter(u => u.distrito === usuario.distrito && u.id !== usuario.id).length
        setStats({ total: data.length, conductores, pasajeros, matches })
      })
      .catch(() => setStats({ total: '–', conductores: '–', pasajeros: '–', matches: '–' }))
  }, [usuario])

  const openEdit = () => {
    setEditForm({
      nombre_completo: usuario.nombre_completo || '',
      telefono: usuario.telefono || '',
      carrera: usuario.carrera || '',
      distrito: usuario.distrito || '',
      horario_entrada: usuario.horario_entrada || '',
      horario_salida: usuario.horario_salida || '',
      bio: usuario.bio || '',
      mostrar_telefono: usuario.mostrar_telefono !== false,
      modelo_auto: usuario.modelo_auto || '',
      placa_auto: usuario.placa_auto || '',
      asientos_disponibles: usuario.asientos_disponibles || '',
    })
    setEditError('')
    setEditOpen(true)
  }

  const setF = (k, v) => setEditForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!editForm.nombre_completo.trim()) { setEditError('El nombre es obligatorio'); return }
    if (!editForm.telefono.trim()) { setEditError('El teléfono es obligatorio'); return }
    if (!editForm.carrera) { setEditError('Selecciona tu carrera'); return }
    if (!editForm.distrito) { setEditError('Selecciona tu distrito'); return }
    if (!editForm.horario_entrada) { setEditError('Selecciona tu horario de entrada'); return }

    setEditLoading(true)
    setEditError('')
    try {
      const payload = {
        nombre_completo: editForm.nombre_completo.trim(),
        telefono: editForm.telefono.trim(),
        carrera: editForm.carrera,
        distrito: editForm.distrito,
        horario_entrada: editForm.horario_entrada,
        horario_salida: editForm.horario_salida || null,
        bio: editForm.bio.trim() || null,
        mostrar_telefono: editForm.mostrar_telefono,
        ...(usuario.tipo_usuario === 'conductor' && {
          modelo_auto: editForm.modelo_auto.trim(),
          placa_auto: editForm.placa_auto.trim().toUpperCase(),
          asientos_disponibles: parseInt(editForm.asientos_disponibles) || null,
        }),
      }
      const { data, error } = await supabase.from('usuarios').update(payload).eq('id', usuario.id).select().single()
      if (error) { setEditError('Error al guardar: ' + error.message); return }
      onUpdate(data)
      setEditOpen(false)
    } catch {
      setEditError('Error de conexión. Intenta de nuevo.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setDeactivateLoading(true)
    try {
      await supabase.from('usuarios').update({ activo: false }).eq('id', usuario.id)
    } finally {
      onLogout()
      navigate('/')
    }
  }

  const firstName = usuario.nombre_completo?.split(' ')[0] || 'Usuario'

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Greeting */}
        <div style={s.topRow}>
          <div>
            <div style={s.greetingSmall}>Bienvenido de vuelta</div>
            <h1 style={s.greetingName}>Hola, {firstName} 👋</h1>
          </div>
          <button style={s.editBtn} onClick={openEdit}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)' }}
          >
            <Edit2 size={14} /> Editar perfil
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Tu distrito</div>
            <div style={{ ...s.statValue, fontSize: '18px', marginTop: '4px' }}>{usuario.distrito}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Matches posibles</div>
            <div style={s.statValue}>{stats.matches}</div>
            <div style={s.statSub}>en {usuario.distrito}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Conductores</div>
            <div style={s.statValue}>{stats.conductores}</div>
            <div style={s.statSub}>registrados</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total usuarios</div>
            <div style={s.statValue}>{stats.total}</div>
            <div style={s.statSub}>en la plataforma</div>
          </div>
        </div>

        {/* CTA */}
        <div style={s.ctaCard}>
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>Ver compañeros de {usuario.distrito}</div>
            <div style={{ color: 'var(--light)', fontSize: '13px' }}>Encuentra estudiantes con quienes compartir el viaje</div>
          </div>
          <button style={s.ctaBtn} onClick={() => navigate('/matches')}>
            Ver matches <ArrowRight size={15} />
          </button>
        </div>

        {/* Profile + extra cards */}
        <div style={s.sectionRow}>
          <div style={s.card}>
            <div style={s.cardTitle}><Users size={15} color="var(--accent)" /> Mi perfil</div>
            {[
              { label: 'Nombre', value: usuario.nombre_completo },
              { label: 'Correo', value: usuario.correo },
              { label: 'Código', value: usuario.codigo_ulima },
              { label: 'Carrera', value: usuario.carrera },
              { label: 'Celular', value: usuario.telefono },
              { label: 'Horario', value: `Entrada: ${usuario.horario_entrada}${usuario.horario_salida ? ' · Salida: ' + usuario.horario_salida : ''}` },
            ].map((r, i, arr) => (
              <div key={i} style={{ ...s.profileRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <span style={s.profileLabel}>{r.label}</span>
                <span style={{ fontWeight: '500', maxWidth: '60%', wordBreak: 'break-all', fontSize: '12px', textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
            {usuario.bio && (
              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--medium)', fontStyle: 'italic' }}>
                "{usuario.bio}"
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={s.card}>
              <div style={s.cardTitle}><Car size={15} color="var(--accent)" /> Tipo de usuario</div>
              <div style={{ ...s.badge, ...(usuario.tipo_usuario === 'conductor' ? s.badgeConductor : s.badgePasajero), fontSize: '14px', padding: '8px 16px', marginBottom: '12px' }}>
                {usuario.tipo_usuario === 'conductor' ? '🚗' : '🎒'} {usuario.tipo_usuario}
              </div>
              {usuario.tipo_usuario === 'conductor' && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--medium)', marginBottom: '4px' }}>Vehículo</div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{usuario.modelo_auto}</div>
                  <div style={{ fontSize: '12px', color: 'var(--medium)', marginTop: '4px' }}>
                    Placa: {usuario.placa_auto} · {usuario.asientos_disponibles} asiento(s)
                  </div>
                </div>
              )}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}><MapPin size={15} color="var(--accent)" /> Ubicación</div>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{usuario.distrito}</div>
              <div style={{ fontSize: '12px', color: 'var(--medium)', lineHeight: '1.6' }}>
                El sistema busca compañeros en tu mismo distrito.
              </div>
            </div>

            <div style={{ ...s.card, background: 'var(--accent-light)', border: '1px solid #A7D9BC' }}>
              <div style={s.cardTitle}><Phone size={15} color="var(--accent)" /> Contacto</div>
              {usuario.mostrar_telefono !== false ? (
                <>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--accent)', marginBottom: '4px' }}>{usuario.telefono}</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', lineHeight: '1.6', opacity: 0.8 }}>
                    <CheckCircle size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    Visible para otros usuarios
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--accent)', opacity: 0.8 }}>
                  Tu teléfono está oculto. Puedes cambiarlo en Editar perfil.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div style={s.dangerCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={16} color="#B84040" />
            <span style={{ fontWeight: '600', fontSize: '14px', color: '#B84040' }}>Desactivar cuenta</span>
          </div>
          <p style={{ fontSize: '13px', color: '#B84040', marginBottom: '16px', lineHeight: '1.5' }}>
            Al desactivar tu cuenta dejarás de aparecer en los resultados de búsqueda. Esta acción no elimina tus datos.
          </p>
          {!deactivateConfirm ? (
            <button
              onClick={() => setDeactivateConfirm(true)}
              style={{ padding: '9px 18px', background: 'white', color: '#B84040', border: '1.5px solid #FECACA', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              Desactivar mi cuenta
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#B84040', fontWeight: '500' }}>¿Estás seguro?</span>
              <button
                onClick={handleDeactivate}
                disabled={deactivateLoading}
                style={{ padding: '9px 18px', background: '#B84040', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: deactivateLoading ? 0.7 : 1 }}
              >
                {deactivateLoading ? 'Desactivando...' : 'Sí, desactivar'}
              </button>
              <button
                onClick={() => setDeactivateConfirm(false)}
                style={{ padding: '9px 18px', background: 'transparent', color: 'var(--medium)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={{ fontWeight: '600', fontSize: '16px' }}>Editar perfil</span>
              <button style={s.closeBtn} onClick={() => setEditOpen(false)}><X size={20} /></button>
            </div>

            <div style={s.modalBody}>
              {editError && <div style={s.alertMsg}>{editError}</div>}

              <div style={s.sectionLabel}>Datos personales</div>

              <div style={s.field}>
                <label style={s.label}>Nombre completo *</label>
                <input style={s.input} value={editForm.nombre_completo} onChange={e => setF('nombre_completo', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Teléfono *</label>
                <input style={s.input} type="tel" value={editForm.telefono} onChange={e => setF('telefono', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Carrera *</label>
                <select style={s.select} value={editForm.carrera} onChange={e => setF('carrera', e.target.value)}>
                  <option value="">Selecciona tu carrera...</option>
                  {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Bio <span style={{ color: 'var(--medium)', fontWeight: '400' }}>(opcional)</span></label>
                <input style={s.input} value={editForm.bio} onChange={e => setF('bio', e.target.value)}
                  placeholder="Ej: Voy a clases de mañana y busco compañeros de Surco"
                  maxLength={200}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div style={{ fontSize: '11px', color: 'var(--medium)', marginTop: '4px' }}>{editForm.bio?.length || 0}/200</div>
              </div>

              <div style={s.sectionLabel}>Ubicación y horario</div>

              <div style={s.field}>
                <label style={s.label}>Distrito *</label>
                <select style={s.select} value={editForm.distrito} onChange={e => setF('distrito', e.target.value)}>
                  <option value="">Selecciona tu distrito...</option>
                  {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ ...s.field, ...s.fieldRow }}>
                <div>
                  <label style={s.label}>Hora de entrada *</label>
                  <select style={s.select} value={editForm.horario_entrada} onChange={e => setF('horario_entrada', e.target.value)}>
                    <option value="">Hora...</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Hora de salida</label>
                  <select style={s.select} value={editForm.horario_salida} onChange={e => setF('horario_salida', e.target.value)}>
                    <option value="">Hora...</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div style={s.sectionLabel}>Privacidad</div>

              <div style={{ ...s.field }}>
                <label style={{ ...s.checkboxRow }} onClick={() => setF('mostrar_telefono', !editForm.mostrar_telefono)}>
                  <div style={{ width: '36px', height: '20px', background: editForm.mostrar_telefono ? 'var(--accent)' : 'var(--border)', borderRadius: '10px', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '2px', left: editForm.mostrar_telefono ? '18px' : '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: 'left 0.2s' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {editForm.mostrar_telefono ? <Eye size={14} color="var(--accent)" /> : <EyeOff size={14} color="var(--medium)" />}
                      Mostrar mi teléfono a otros usuarios
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--medium)', marginTop: '2px' }}>
                      {editForm.mostrar_telefono ? 'Tu número es visible para coordinar viajes' : 'Tu número estará oculto'}
                    </div>
                  </div>
                </label>
              </div>

              {usuario.tipo_usuario === 'conductor' && (
                <>
                  <div style={s.sectionLabel}>Datos del vehículo</div>
                  <div style={s.field}>
                    <label style={s.label}>Marca y modelo</label>
                    <input style={s.input} value={editForm.modelo_auto} onChange={e => setF('modelo_auto', e.target.value)}
                      placeholder="Ej: Toyota Corolla 2020"
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div style={{ ...s.field, ...s.fieldRow }}>
                    <div>
                      <label style={s.label}>Placa</label>
                      <input style={s.input} value={editForm.placa_auto} onChange={e => setF('placa_auto', e.target.value)}
                        placeholder="ABC-123"
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <label style={s.label}>Asientos disponibles</label>
                      <input style={s.input} type="number" min="1" max="6" value={editForm.asientos_disponibles} onChange={e => setF('asientos_disponibles', e.target.value)}
                        placeholder="1–6"
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setEditOpen(false)}>Cancelar</button>
              <button style={{ ...s.saveBtn, opacity: editLoading ? 0.7 : 1 }} onClick={handleSave} disabled={editLoading}>
                {editLoading ? 'Guardando...' : <><Save size={14} /> Guardar cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
