import { useState, useEffect, useCallback } from 'react'
import { Car, MapPin, Calendar, Clock, Users, Plus, X, Check, Phone, ArrowRight, Ban, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DISTRITOS, HORARIOS } from '../lib/constants'
import { whatsappUrl } from '../lib/validation'
import { mapaReputacion } from '../lib/resenas'
import Stars from '../components/Stars'
import {
  SENTIDO_LABEL, ESTADO_RESERVA, asientosDisponibles, viajeReservable,
  formatearFecha, fechaHoyISO,
} from '../lib/viajes'
import s from './Viajes.module.css'

const iniciales = (nombre) => {
  const p = (nombre || '?').split(' ')
  return (p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase()
}

export default function Viajes({ usuario }) {
  const esConductor = usuario.tipo_usuario === 'conductor'
  const [tab, setTab] = useState('disponibles')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [disponibles, setDisponibles] = useState([])
  const [misViajes, setMisViajes] = useState([])
  const [misReservas, setMisReservas] = useState([])       // como pasajero
  const [reservasRecibidas, setReservasRecibidas] = useState([]) // como conductor
  const [reputacion, setReputacion] = useState({})         // { usuario_id: {promedio,total} }
  const [resenadas, setResenadas] = useState(new Set())    // reserva_id ya calificadas por mí

  const [pubOpen, setPubOpen] = useState(false)
  const [calificando, setCalificando] = useState(null)     // reserva a calificar

  const refrescar = useCallback(async () => {
    setLoading(true)
    setError('')
    const hoy = fechaHoyISO()
    try {
      const [disp, reservas, mios, rep, misResenas] = await Promise.all([
        supabase.from('viajes_detalle').select('*')
          .eq('estado', 'activo').gte('fecha', hoy).neq('conductor_id', usuario.id)
          .order('fecha', { ascending: true }),
        supabase.from('reservas_detalle').select('*').order('created_at', { ascending: false }),
        esConductor
          ? supabase.from('viajes_detalle').select('*').eq('conductor_id', usuario.id).order('fecha', { ascending: false })
          : Promise.resolve({ data: [] }),
        supabase.from('reputacion_usuarios').select('*'),
        supabase.from('resenas').select('reserva_id').eq('autor_id', usuario.id),
      ])
      setDisponibles(disp.data || [])
      const rr = reservas.data || []
      setMisReservas(rr.filter(r => r.pasajero_id === usuario.id))
      setReservasRecibidas(rr.filter(r => r.conductor_id === usuario.id && r.pasajero_id !== usuario.id))
      setMisViajes(mios.data || [])
      setReputacion(mapaReputacion(rep.data))
      setResenadas(new Set((misResenas.data || []).map(r => r.reserva_id)))
    } catch {
      setError('No se pudieron cargar los viajes. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [usuario.id, esConductor])

  // refrescar() setea loading=true, que en el montaje es no-op (ya es true).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refrescar() }, [refrescar])

  // Reserva del usuario para un viaje (si existe), para mostrar estado en "Disponibles"
  const miReservaDe = (viajeId) => misReservas.find(r => r.viaje_id === viajeId)

  const solicitar = async (viaje) => {
    setError('')
    const { error } = await supabase.from('reservas').insert([{ viaje_id: viaje.id, pasajero_id: usuario.id }])
    if (error) {
      setError(error.code === '23505' ? 'Ya solicitaste un asiento en este viaje.' : 'No se pudo enviar la solicitud: ' + error.message)
      return
    }
    refrescar()
  }

  const cambiarReserva = async (reservaId, estado) => {
    setError('')
    const { error } = await supabase.from('reservas').update({ estado }).eq('id', reservaId)
    if (error) {
      setError(estado === 'confirmada' ? (error.message.includes('asientos') ? 'No hay asientos disponibles.' : 'No se pudo confirmar: ' + error.message) : 'No se pudo actualizar la reserva.')
      return
    }
    refrescar()
  }

  const cancelarViaje = async (viajeId) => {
    setError('')
    await supabase.from('viajes').update({ estado: 'cancelado' }).eq('id', viajeId)
    refrescar()
  }

  const guardarResena = async (reserva, puntuacion, comentario) => {
    setError('')
    const { error } = await supabase.from('resenas').insert([{
      reserva_id: reserva.id,
      autor_id: usuario.id,
      destinatario_id: reserva.conductor_id,
      puntuacion,
      comentario: comentario.trim() || null,
    }])
    if (error) {
      setError(error.code === '23505' ? 'Ya calificaste este viaje.' : 'No se pudo guardar la reseña: ' + error.message)
      return
    }
    setCalificando(null)
    refrescar()
  }

  const tabs = [
    { id: 'disponibles', label: 'Disponibles' },
    ...(esConductor ? [{ id: 'misViajes', label: 'Mis viajes' }] : []),
    { id: 'misReservas', label: 'Mis reservas' },
  ]

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <div className={s.topRow}>
          <div>
            <h1 className={s.title}>Viajes</h1>
            <p className={s.subtitle}>Publica tu viaje o reserva un asiento con un compañero</p>
          </div>
          {esConductor && (
            <button className={s.publishBtn} onClick={() => setPubOpen(true)}>
              <Plus size={16} /> Publicar viaje
            </button>
          )}
        </div>

        <div className={s.tabs}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? `${s.tab} ${s.tabActive}` : s.tab}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className={s.alert}>{error}</div>}

        {loading ? (
          <div className={s.loading}>Cargando viajes...</div>
        ) : (
          <>
            {tab === 'disponibles' && (
              <ViajesDisponibles viajes={disponibles} reputacion={reputacion} miReservaDe={miReservaDe} onSolicitar={solicitar} />
            )}
            {tab === 'misViajes' && esConductor && (
              <MisViajes viajes={misViajes} reservas={reservasRecibidas} onCambiar={cambiarReserva} onCancelar={cancelarViaje} />
            )}
            {tab === 'misReservas' && (
              <MisReservas
                reservas={misReservas}
                reputacion={reputacion}
                resenadas={resenadas}
                onCancelar={(id) => cambiarReserva(id, 'cancelada')}
                onCalificar={setCalificando}
              />
            )}
          </>
        )}
      </div>

      {pubOpen && (
        <PublicarViaje usuario={usuario} onClose={() => setPubOpen(false)} onDone={() => { setPubOpen(false); setTab('misViajes'); refrescar() }} />
      )}
      {calificando && (
        <CalificarModal reserva={calificando} onClose={() => setCalificando(null)} onGuardar={guardarResena} />
      )}
    </div>
  )
}

const ReputacionInline = ({ rep }) => (
  rep && rep.total > 0
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Stars value={rep.promedio} size={12} /><span style={{ fontSize: 11, color: 'var(--medium)' }}>{rep.promedio} ({rep.total})</span></span>
    : <span style={{ fontSize: 11, color: 'var(--light)' }}>Sin reseñas</span>
)

// ---------- Disponibles ----------
function ViajesDisponibles({ viajes, reputacion, miReservaDe, onSolicitar }) {
  if (viajes.length === 0) {
    return (
      <div className={s.empty}>
        <Car size={32} color="var(--border)" style={{ marginBottom: 12 }} />
        <div className={s.emptyTitle}>No hay viajes publicados</div>
        <div style={{ fontSize: 13 }}>Cuando un conductor publique un viaje, aparecerá aquí.</div>
      </div>
    )
  }
  return (
    <div className={s.grid}>
      {viajes.map(v => {
        const libres = asientosDisponibles(v)
        const reservable = viajeReservable(v)
        const reserva = miReservaDe(v.id)
        return (
          <div key={v.id} className={s.card}>
            <div className={s.cardHead}>
              <div className={s.avatar}>{iniciales(v.conductor_nombre)}</div>
              <div>
                <div className={s.name}>{v.conductor_nombre}</div>
                <div className={s.carrera}>{v.modelo_auto || v.conductor_carrera}</div>
                <ReputacionInline rep={reputacion[v.conductor_id]} />
              </div>
              <span className={s.sentido}>{SENTIDO_LABEL[v.sentido]}</span>
            </div>

            <div className={s.route}>
              <MapPin size={14} color="var(--accent)" />
              {v.sentido === 'ida' ? `${v.distrito_origen} → Ulima` : `Ulima → ${v.distrito_origen}`}
            </div>
            <div className={s.infoRow}><Calendar size={12} /> {formatearFecha(v.fecha)}</div>
            <div className={s.infoRow}><Clock size={12} /> {v.hora}</div>
            <div className={libres > 0 ? s.seats : `${s.seats} ${s.seatsFull}`}>
              <Users size={12} /> {libres} de {v.asientos_totales} asiento(s) libre(s)
            </div>
            {v.notas && <div className={s.notas}>"{v.notas}"</div>}

            <div className={s.divider} />

            {reserva ? (
              <div className={s.badge} style={{ background: ESTADO_RESERVA[reserva.estado].bg, color: ESTADO_RESERVA[reserva.estado].color }}>
                Tu solicitud: {ESTADO_RESERVA[reserva.estado].label}
              </div>
            ) : (
              <button className={s.btnPrimary} disabled={!reservable} onClick={() => onSolicitar(v)}>
                {reservable ? <><Check size={14} /> Solicitar asiento</> : 'Sin cupos disponibles'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Mis viajes (conductor) ----------
function MisViajes({ viajes, reservas, onCambiar, onCancelar }) {
  if (viajes.length === 0) {
    return (
      <div className={s.empty}>
        <Car size={32} color="var(--border)" style={{ marginBottom: 12 }} />
        <div className={s.emptyTitle}>Aún no publicas viajes</div>
        <div style={{ fontSize: 13 }}>Usa "Publicar viaje" para ofrecer asientos a tus compañeros.</div>
      </div>
    )
  }
  return (
    <div className={s.grid}>
      {viajes.map(v => {
        const solicitudes = reservas.filter(r => r.viaje_id === v.id && r.estado !== 'cancelada' && r.estado !== 'rechazada')
        const libres = asientosDisponibles(v)
        return (
          <div key={v.id} className={s.card}>
            <div className={s.route}>
              <MapPin size={14} color="var(--accent)" />
              {v.sentido === 'ida' ? `${v.distrito_origen} → Ulima` : `Ulima → ${v.distrito_origen}`}
              <span className={s.sentido} style={{ marginLeft: 'auto' }}>{v.estado}</span>
            </div>
            <div className={s.infoRow}><Calendar size={12} /> {formatearFecha(v.fecha)} · <Clock size={12} /> {v.hora}</div>
            <div className={libres > 0 ? s.seats : `${s.seats} ${s.seatsFull}`}>
              <Users size={12} /> {libres} de {v.asientos_totales} libre(s)
            </div>

            <div className={s.divider} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--medium)', marginBottom: 4 }}>
              Solicitudes ({solicitudes.length})
            </div>
            {solicitudes.length === 0 && <div style={{ fontSize: 12, color: 'var(--medium)' }}>Sin solicitudes todavía.</div>}
            {solicitudes.map(r => (
              <div key={r.id} className={s.reservaItem}>
                <span className={s.reservaName}>{r.pasajero_nombre}</span>
                {r.estado === 'pendiente' ? (
                  <div className={s.reservaActions}>
                    <button className={s.btnConfirm} onClick={() => onCambiar(r.id, 'confirmada')}>Confirmar</button>
                    <button className={s.btnReject} onClick={() => onCambiar(r.id, 'rechazada')}>Rechazar</button>
                  </div>
                ) : (
                  <div className={s.reservaActions}>
                    <span className={s.badge} style={{ background: ESTADO_RESERVA[r.estado].bg, color: ESTADO_RESERVA[r.estado].color }}>
                      {ESTADO_RESERVA[r.estado].label}
                    </span>
                    {r.estado === 'confirmada' && whatsappUrl(r.pasajero_telefono) && (
                      <a className={s.btnGhost} href={whatsappUrl(r.pasajero_telefono, `Hola ${r.pasajero_nombre?.split(' ')[0] || ''}, sobre el viaje de Carpool Ulima 🚗`)} target="_blank" rel="noreferrer">
                        <Phone size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            {v.estado === 'activo' && (
              <>
                <div className={s.divider} />
                <button className={s.btnDanger} onClick={() => onCancelar(v.id)}><Ban size={12} /> Cancelar viaje</button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Mis reservas (pasajero) ----------
function MisReservas({ reservas, reputacion, resenadas, onCancelar, onCalificar }) {
  const activas = reservas.filter(r => r.viaje_estado !== 'cancelado')
  if (activas.length === 0) {
    return (
      <div className={s.empty}>
        <Users size={32} color="var(--border)" style={{ marginBottom: 12 }} />
        <div className={s.emptyTitle}>No tienes reservas</div>
        <div style={{ fontSize: 13 }}>Solicita un asiento en la pestaña "Disponibles".</div>
      </div>
    )
  }
  return (
    <div className={s.grid}>
      {activas.map(r => (
        <div key={r.id} className={s.card}>
          <div className={s.route}>
            <MapPin size={14} color="var(--accent)" />
            {r.sentido === 'ida' ? `${r.distrito_origen} → Ulima` : `Ulima → ${r.distrito_origen}`}
          </div>
          <div className={s.infoRow}><Car size={12} /> {r.conductor_nombre}{r.modelo_auto ? ` · ${r.modelo_auto}` : ''}</div>
          <div style={{ marginBottom: 6 }}><ReputacionInline rep={reputacion[r.conductor_id]} /></div>
          <div className={s.infoRow}><Calendar size={12} /> {formatearFecha(r.fecha)} · <Clock size={12} /> {r.hora}</div>
          <div className={s.badge} style={{ background: ESTADO_RESERVA[r.estado].bg, color: ESTADO_RESERVA[r.estado].color, marginTop: 4 }}>
            {ESTADO_RESERVA[r.estado].label}
          </div>

          <div className={s.divider} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {r.estado === 'confirmada' && whatsappUrl(r.conductor_telefono) && (
              <a className={s.btnGhost} href={whatsappUrl(r.conductor_telefono, `Hola ${r.conductor_nombre?.split(' ')[0] || ''}, confirmo mi asiento del viaje en Carpool Ulima 🚗`)} target="_blank" rel="noreferrer">
                <Phone size={13} /> Coordinar
              </a>
            )}
            {r.estado === 'confirmada' && (
              resenadas.has(r.id)
                ? <span style={{ fontSize: 12, color: 'var(--medium)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Star size={12} color="#F59E0B" fill="#F59E0B" /> Ya calificaste</span>
                : <button className={s.btnGhost} onClick={() => onCalificar(r)}><Star size={13} /> Calificar conductor</button>
            )}
            {r.estado === 'pendiente' && (
              <button className={s.btnDanger} onClick={() => onCancelar(r.id)}><X size={12} /> Cancelar reserva</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Modal calificar ----------
function CalificarModal({ reserva, onClose, onGuardar }) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const guardar = async () => {
    if (puntuacion < 1) { setError('Selecciona una puntuación'); return }
    setLoading(true)
    await onGuardar(reserva, puntuacion, comentario)
    setLoading(false)
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>Calificar a {reserva.conductor_nombre?.split(' ')[0]}</span>
          <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={s.modalBody}>
          {error && <div className={s.alert}>{error}</div>}
          <div className={s.field}>
            <label className={s.label}>Tu puntuación</label>
            <Stars value={puntuacion} size={28} onSelect={(n) => { setPuntuacion(n); setError('') }} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Comentario <span style={{ color: 'var(--medium)', fontWeight: 400 }}>(opcional)</span></label>
            <input className={s.input} value={comentario} maxLength={300} onChange={e => setComentario(e.target.value)} placeholder="Ej: Puntual y buen trato" />
          </div>
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={s.saveBtn} onClick={guardar} disabled={loading}>
            {loading ? 'Guardando...' : <><Star size={14} /> Enviar reseña</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Modal publicar viaje ----------
function PublicarViaje({ usuario, onClose, onDone }) {
  const [form, setForm] = useState({
    distrito_origen: usuario.distrito || '',
    sentido: 'ida',
    fecha: '',
    hora: usuario.horario_entrada || '',
    asientos_totales: usuario.asientos_disponibles || '',
    notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const guardar = async () => {
    setError('')
    if (!form.distrito_origen) return setError('Selecciona el distrito de origen')
    if (!form.fecha) return setError('Selecciona la fecha')
    if (form.fecha < fechaHoyISO()) return setError('La fecha no puede ser en el pasado')
    if (!form.hora) return setError('Selecciona la hora')
    const asientos = parseInt(form.asientos_totales, 10)
    if (!asientos || asientos < 1 || asientos > 6) return setError('Asientos entre 1 y 6')

    setLoading(true)
    const { error } = await supabase.from('viajes').insert([{
      conductor_id: usuario.id,
      distrito_origen: form.distrito_origen,
      sentido: form.sentido,
      fecha: form.fecha,
      hora: form.hora,
      asientos_totales: asientos,
      notas: form.notas.trim() || null,
    }])
    setLoading(false)
    if (error) { setError('No se pudo publicar: ' + error.message); return }
    onDone()
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>Publicar viaje</span>
          <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={s.modalBody}>
          {error && <div className={s.alert}>{error}</div>}
          <div className={s.field}>
            <label className={s.label}>Sentido</label>
            <select className={`${s.input} ${s.select}`} value={form.sentido} onChange={e => set('sentido', e.target.value)}>
              <option value="ida">Hacia la U (desde mi distrito)</option>
              <option value="vuelta">Desde la U (hacia mi distrito)</option>
            </select>
          </div>
          <div className={s.field}>
            <label className={s.label}>Distrito de origen/destino</label>
            <select className={`${s.input} ${s.select}`} value={form.distrito_origen} onChange={e => set('distrito_origen', e.target.value)}>
              <option value="">Selecciona...</option>
              {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className={s.fieldRow}>
            <div className={s.field}>
              <label className={s.label}>Fecha</label>
              <input className={s.input} type="date" min={fechaHoyISO()} value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Hora</label>
              <select className={`${s.input} ${s.select}`} value={form.hora} onChange={e => set('hora', e.target.value)}>
                <option value="">Hora...</option>
                {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Asientos disponibles</label>
            <input className={s.input} type="number" min="1" max="6" value={form.asientos_totales} onChange={e => set('asientos_totales', e.target.value)} placeholder="1–6" />
          </div>
          <div className={s.field}>
            <label className={s.label}>Notas <span style={{ color: 'var(--medium)', fontWeight: 400 }}>(opcional)</span></label>
            <input className={s.input} value={form.notas} maxLength={200} onChange={e => set('notas', e.target.value)} placeholder="Ej: Salgo puntual desde el óvalo" />
          </div>
        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={s.saveBtn} onClick={guardar} disabled={loading}>
            {loading ? 'Publicando...' : <><ArrowRight size={14} /> Publicar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
