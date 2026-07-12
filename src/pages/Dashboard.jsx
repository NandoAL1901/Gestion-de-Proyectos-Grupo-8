import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, MapPin, Phone, ArrowRight, CheckCircle, Edit2, X, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DISTRITOS, CARRERAS, HORARIOS } from '../lib/constants'
import { esTelefonoValido, normalizarTelefono, esPlacaValida } from '../lib/validation'
import { reputacionTexto } from '../lib/resenas'
import Stars from '../components/Stars'
import s from './Dashboard.module.css'

export default function Dashboard({ usuario, onUpdate, onLogout }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, conductores: 0, pasajeros: 0, matches: 0 })
  const [reputacion, setReputacion] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  useEffect(() => {
    supabase.from('usuarios_directorio').select('id, tipo_usuario, distrito')
      .then(({ data }) => {
        if (!data) return
        const conductores = data.filter(u => u.tipo_usuario === 'conductor').length
        const pasajeros = data.filter(u => u.tipo_usuario === 'pasajero').length
        const matches = data.filter(u => u.distrito === usuario.distrito && u.id !== usuario.id).length
        setStats({ total: data.length, conductores, pasajeros, matches })
      })
      .catch(() => setStats({ total: '–', conductores: '–', pasajeros: '–', matches: '–' }))

    supabase.from('reputacion_usuarios').select('promedio, total').eq('usuario_id', usuario.id).maybeSingle()
      .then(({ data }) => setReputacion(data))
      .catch(() => {})
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
    if (!esTelefonoValido(editForm.telefono)) { setEditError('Ingresa un celular peruano válido (9 dígitos, empieza en 9)'); return }
    if (!editForm.carrera) { setEditError('Selecciona tu carrera'); return }
    if (!editForm.distrito) { setEditError('Selecciona tu distrito'); return }
    if (!editForm.horario_entrada) { setEditError('Selecciona tu horario de entrada'); return }
    if (usuario.tipo_usuario === 'conductor' && editForm.placa_auto?.trim() && !esPlacaValida(editForm.placa_auto)) { setEditError('Placa inválida (ej: ABC-123)'); return }

    setEditLoading(true)
    setEditError('')
    try {
      const payload = {
        nombre_completo: editForm.nombre_completo.trim(),
        telefono: normalizarTelefono(editForm.telefono),
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
  const esConductor = usuario.tipo_usuario === 'conductor'

  return (
    <div className={s.page}>
      <div className={s.inner}>

        {/* Greeting */}
        <div className={s.topRow}>
          <div>
            <div className={s.greetingSmall}>Bienvenido de vuelta</div>
            <h1 className={s.greetingName}>Hola, {firstName} 👋</h1>
          </div>
          <button className={s.editBtn} onClick={openEdit}>
            <Edit2 size={14} /> Editar perfil
          </button>
        </div>

        {/* Stats */}
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <div className={s.statLabel}>Tu distrito</div>
            <div className={`${s.statValue} ${s.statValueSmall}`}>{usuario.distrito}</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>Matches posibles</div>
            <div className={s.statValue}>{stats.matches}</div>
            <div className={s.statSub}>en {usuario.distrito}</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>Conductores</div>
            <div className={s.statValue}>{stats.conductores}</div>
            <div className={s.statSub}>registrados</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>Total usuarios</div>
            <div className={s.statValue}>{stats.total}</div>
            <div className={s.statSub}>en la plataforma</div>
          </div>
        </div>

        {/* CTA */}
        <div className={s.ctaCard}>
          <div>
            <div className={s.ctaTitle}>Ver compañeros de {usuario.distrito}</div>
            <div className={s.ctaSub}>Encuentra estudiantes con quienes compartir el viaje</div>
          </div>
          <button className={s.ctaBtn} onClick={() => navigate('/matches')}>
            Ver matches <ArrowRight size={15} />
          </button>
        </div>

        {/* Profile + extra cards */}
        <div className={s.sectionRow}>
          <div className={s.card}>
            <div className={s.cardTitle}><Users size={15} color="var(--accent)" /> Mi perfil</div>
            {[
              { label: 'Nombre', value: usuario.nombre_completo },
              { label: 'Correo', value: usuario.correo },
              { label: 'Código', value: usuario.codigo_ulima },
              { label: 'Carrera', value: usuario.carrera },
              { label: 'Celular', value: usuario.telefono },
              { label: 'Horario', value: `Entrada: ${usuario.horario_entrada}${usuario.horario_salida ? ' · Salida: ' + usuario.horario_salida : ''}` },
            ].map((r, i) => (
              <div key={i} className={s.profileRow}>
                <span className={s.profileLabel}>{r.label}</span>
                <span className={s.profileValue}>{r.value}</span>
              </div>
            ))}
            {usuario.bio && (
              <div className={s.bioBox}>"{usuario.bio}"</div>
            )}
          </div>

          <div className={s.sideCol}>
            <div className={s.card}>
              <div className={s.cardTitle}><Car size={15} color="var(--accent)" /> Tipo de usuario</div>
              <div className={`${s.badge} ${s.badgeLarge} ${esConductor ? s.badgeConductor : s.badgePasajero}`}>
                {esConductor ? '🚗' : '🎒'} {usuario.tipo_usuario}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: esConductor ? 12 : 0 }}>
                <Stars value={reputacion?.promedio || 0} size={14} />
                <span style={{ fontSize: 12, color: 'var(--medium)' }}>{reputacionTexto(reputacion)}</span>
              </div>
              {esConductor && (
                <div>
                  <div className={s.mutedLabel}>Vehículo</div>
                  <div className={s.vehiculoModelo}>{usuario.modelo_auto}</div>
                  <div className={s.vehiculoPlaca}>
                    Placa: {usuario.placa_auto} · {usuario.asientos_disponibles} asiento(s)
                  </div>
                </div>
              )}
            </div>

            <div className={s.card}>
              <div className={s.cardTitle}><MapPin size={15} color="var(--accent)" /> Ubicación</div>
              <div className={s.ubicacionValue}>{usuario.distrito}</div>
              <div className={s.ubicacionText}>
                El sistema busca compañeros en tu mismo distrito.
              </div>
            </div>

            <div className={`${s.card} ${s.cardContact}`}>
              <div className={s.cardTitle}><Phone size={15} color="var(--accent)" /> Contacto</div>
              {usuario.mostrar_telefono !== false ? (
                <>
                  <div className={s.contactPhone}>{usuario.telefono}</div>
                  <div className={s.contactVisible}>
                    <CheckCircle size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    Visible para otros usuarios
                  </div>
                </>
              ) : (
                <div className={s.contactHidden}>
                  Tu teléfono está oculto. Puedes cambiarlo en Editar perfil.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className={s.dangerCard}>
          <div className={s.dangerHeader}>
            <AlertTriangle size={16} color="#B84040" />
            <span className={s.dangerTitle}>Desactivar cuenta</span>
          </div>
          <p className={s.dangerText}>
            Al desactivar tu cuenta dejarás de aparecer en los resultados de búsqueda. Esta acción no elimina tus datos.
          </p>
          {!deactivateConfirm ? (
            <button onClick={() => setDeactivateConfirm(true)} className={s.dangerBtn}>
              Desactivar mi cuenta
            </button>
          ) : (
            <div className={s.dangerConfirmRow}>
              <span className={s.dangerConfirmText}>¿Estás seguro?</span>
              <button onClick={handleDeactivate} disabled={deactivateLoading} className={s.dangerConfirmBtn}>
                {deactivateLoading ? 'Desactivando...' : 'Sí, desactivar'}
              </button>
              <button onClick={() => setDeactivateConfirm(false)} className={s.dangerCancelBtn}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setEditOpen(false)}>
          <div className={s.modal}>
            <div className={s.modalHeader}>
              <span className={s.modalTitle}>Editar perfil</span>
              <button className={s.closeBtn} onClick={() => setEditOpen(false)}><X size={20} /></button>
            </div>

            <div className={s.modalBody}>
              {editError && <div className={s.alertMsg}>{editError}</div>}

              <div className={s.sectionLabel}>Datos personales</div>

              <div className={s.field}>
                <label className={s.label}>Nombre completo *</label>
                <input className={s.input} value={editForm.nombre_completo} onChange={e => setF('nombre_completo', e.target.value)} />
              </div>

              <div className={s.field}>
                <label className={s.label}>Teléfono *</label>
                <input className={s.input} type="tel" value={editForm.telefono} onChange={e => setF('telefono', e.target.value)} />
              </div>

              <div className={s.field}>
                <label className={s.label}>Carrera *</label>
                <select className={s.select} value={editForm.carrera} onChange={e => setF('carrera', e.target.value)}>
                  <option value="">Selecciona tu carrera...</option>
                  {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={s.field}>
                <label className={s.label}>Bio <span style={{ color: 'var(--medium)', fontWeight: '400' }}>(opcional)</span></label>
                <input className={s.input} value={editForm.bio} onChange={e => setF('bio', e.target.value)}
                  placeholder="Ej: Voy a clases de mañana y busco compañeros de Surco"
                  maxLength={200} />
                <div className={s.charCount}>{editForm.bio?.length || 0}/200</div>
              </div>

              <div className={s.sectionLabel}>Ubicación y horario</div>

              <div className={s.field}>
                <label className={s.label}>Distrito *</label>
                <select className={s.select} value={editForm.distrito} onChange={e => setF('distrito', e.target.value)}>
                  <option value="">Selecciona tu distrito...</option>
                  {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className={`${s.field} ${s.fieldRow}`}>
                <div>
                  <label className={s.label}>Hora de entrada *</label>
                  <select className={s.select} value={editForm.horario_entrada} onChange={e => setF('horario_entrada', e.target.value)}>
                    <option value="">Hora...</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className={s.label}>Hora de salida</label>
                  <select className={s.select} value={editForm.horario_salida} onChange={e => setF('horario_salida', e.target.value)}>
                    <option value="">Hora...</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className={s.sectionLabel}>Privacidad</div>

              <div className={s.field}>
                <label className={s.checkboxRow} onClick={() => setF('mostrar_telefono', !editForm.mostrar_telefono)}>
                  <div className={`${s.toggleTrack} ${editForm.mostrar_telefono ? s.toggleTrackOn : ''}`}>
                    <div className={`${s.toggleKnob} ${editForm.mostrar_telefono ? s.toggleKnobOn : ''}`} />
                  </div>
                  <div>
                    <div className={s.toggleLabel}>
                      {editForm.mostrar_telefono ? <Eye size={14} color="var(--accent)" /> : <EyeOff size={14} color="var(--medium)" />}
                      Mostrar mi teléfono a otros usuarios
                    </div>
                    <div className={s.toggleHint}>
                      {editForm.mostrar_telefono ? 'Tu número es visible para coordinar viajes' : 'Tu número estará oculto'}
                    </div>
                  </div>
                </label>
              </div>

              {esConductor && (
                <>
                  <div className={s.sectionLabel}>Datos del vehículo</div>
                  <div className={s.field}>
                    <label className={s.label}>Marca y modelo</label>
                    <input className={s.input} value={editForm.modelo_auto} onChange={e => setF('modelo_auto', e.target.value)}
                      placeholder="Ej: Toyota Corolla 2020" />
                  </div>
                  <div className={`${s.field} ${s.fieldRow}`}>
                    <div>
                      <label className={s.label}>Placa</label>
                      <input className={s.input} value={editForm.placa_auto} onChange={e => setF('placa_auto', e.target.value)}
                        placeholder="ABC-123" />
                    </div>
                    <div>
                      <label className={s.label}>Asientos disponibles</label>
                      <input className={s.input} type="number" min="1" max="6" value={editForm.asientos_disponibles} onChange={e => setF('asientos_disponibles', e.target.value)}
                        placeholder="1–6" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={s.modalFooter}>
              <button className={s.cancelBtn} onClick={() => setEditOpen(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleSave} disabled={editLoading}>
                {editLoading ? 'Guardando...' : <><Save size={14} /> Guardar cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
