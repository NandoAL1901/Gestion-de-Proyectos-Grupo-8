import { useState, useEffect } from 'react'
import { MapPin, Car, User, Phone, Clock, Search, PhoneOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { HORARIOS } from '../lib/constants'
import { whatsappUrl } from '../lib/validation'
import s from './Matches.module.css'

const AVATARS_BG = ['#E8F5EF', '#EFF6FF', '#FEF3C7', '#FCE7F3', '#F0FDF4', '#EEF2FF']
const AVATARS_COLOR = ['var(--accent)', '#2563EB', '#92400E', '#BE185D', '#15803D', '#4338CA']
const PAGE_SIZE = 12

export default function Matches({ usuario }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroHorario, setFiltroHorario] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuarios_directorio')
        .select('id, nombre_completo, carrera, distrito, tipo_usuario, horario_entrada, horario_salida, telefono, modelo_auto, asientos_disponibles, bio, mostrar_telefono, created_at')
        .eq('distrito', usuario.distrito)
        .neq('id', usuario.id)
        .order('created_at', { ascending: false })
      if (cancelado) return
      setUsuarios(!error && data ? data : [])
      setLoading(false)
    }
    cargar()
    return () => { cancelado = true }
  }, [usuario.id, usuario.distrito])

  // Al cambiar un filtro, reiniciamos la paginación (ver los onChange de los selects)
  const cambiarFiltroTipo = (v) => { setFiltroTipo(v); setVisibleCount(PAGE_SIZE) }
  const cambiarFiltroHorario = (v) => { setFiltroHorario(v); setVisibleCount(PAGE_SIZE) }

  const filtered = usuarios.filter(u => {
    if (filtroTipo !== 'todos' && u.tipo_usuario !== filtroTipo) return false
    if (filtroHorario && u.horario_entrada !== filtroHorario) return false
    return true
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const getInitials = (name) => {
    const parts = name?.split(' ') || ['?']
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0]?.substring(0, 2) || '?'
  }

  const getAvatarStyle = (name) => {
    const i = (name?.charCodeAt(0) || 0) % AVATARS_BG.length
    return { background: AVATARS_BG[i], color: AVATARS_COLOR[i] }
  }

  const mismoHorario = (u) => u.horario_entrada === usuario.horario_entrada

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <div className={s.header}>
          <h1 className={s.title}>Compañeros de carpool</h1>
          <p className={s.subtitle}>
            Estudiantes de <strong>{usuario.distrito}</strong> que buscan compartir el viaje a la Ulima
          </p>
        </div>

        {/* Filters */}
        <div className={s.filters}>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Tipo</label>
            <select value={filtroTipo} onChange={e => cambiarFiltroTipo(e.target.value)} className={s.select}>
              <option value="todos">Todos</option>
              <option value="conductor">Conductores</option>
              <option value="pasajero">Pasajeros</option>
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Horario de entrada</label>
            <select value={filtroHorario} onChange={e => cambiarFiltroHorario(e.target.value)} className={s.select}>
              <option value="">Todos los horarios</option>
              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <button className={s.myDistrictBtn} onClick={() => cambiarFiltroHorario(usuario.horario_entrada || '')}>
            <Clock size={13} /> Mi horario
          </button>
        </div>

        {/* Count */}
        <div className={s.count}>
          {loading ? '' : `${filtered.length} estudiante${filtered.length !== 1 ? 's' : ''} de ${usuario.distrito}${filtroHorario ? ` · ${filtroHorario}` : ''}`}
        </div>

        {loading ? (
          <div className={s.loading}>Cargando estudiantes...</div>
        ) : filtered.length === 0 ? (
          <div className={s.emptyState}>
            <Search size={32} color="var(--border)" style={{ marginBottom: '12px' }} />
            <div className={s.emptyTitle}>Sin resultados</div>
            <div className={s.emptyText}>No hay estudiantes con estos filtros. Intenta cambiar el distrito o tipo.</div>
          </div>
        ) : (
          <>
            <div className={s.grid}>
              {visible.map(u => (
                <div key={u.id} className={s.card}>
                  <div className={s.cardTop}>
                    <div className={s.avatar} style={getAvatarStyle(u.nombre_completo)}>
                      {getInitials(u.nombre_completo).toUpperCase()}
                    </div>
                    <div className={s.cardMeta}>
                      <div className={s.cardName}>{u.nombre_completo}</div>
                      <div className={s.cardCarrera}>{u.carrera}</div>
                      <div className={s.tagRow}>
                        {u.distrito === usuario.distrito && (
                          <div className={s.matchBadge}>✦ Mismo distrito</div>
                        )}
                        {mismoHorario(u) && (
                          <div className={s.horarioBadge}>⏰ Mismo horario</div>
                        )}
                      </div>
                    </div>
                    <div className={`${s.badge} ${u.tipo_usuario === 'conductor' ? s.badgeConductor : s.badgePasajero}`}>
                      {u.tipo_usuario === 'conductor' ? <Car size={10} /> : <User size={10} />}
                      {u.tipo_usuario}
                    </div>
                  </div>

                  <div className={s.infoRow}><MapPin size={12} color="var(--accent)" />{u.distrito}</div>
                  <div className={s.infoRow}>
                    <Clock size={12} color="var(--medium)" />
                    {u.horario_entrada}{u.horario_salida ? ` – ${u.horario_salida}` : ''}
                  </div>
                  {u.tipo_usuario === 'conductor' && u.modelo_auto && (
                    <div className={s.infoRow}>
                      <Car size={12} color="var(--medium)" />
                      {u.modelo_auto}{u.asientos_disponibles ? ` · ${u.asientos_disponibles} asiento(s)` : ''}
                    </div>
                  )}
                  {u.bio && <div className={s.bioText}>"{u.bio}"</div>}

                  <div className={s.divider} />

                  {u.mostrar_telefono !== false && whatsappUrl(u.telefono) ? (
                    <a
                      href={whatsappUrl(u.telefono, `Hola ${u.nombre_completo?.split(' ')[0] || ''}, te contacto por Carpool Ulima para coordinar el viaje a la U 🚗`)}
                      target="_blank"
                      rel="noreferrer"
                      className={s.contactBtn}
                    >
                      <Phone size={13} /> Contactar por WhatsApp
                    </a>
                  ) : (
                    <div className={s.noContactMsg}>
                      <PhoneOff size={13} /> Prefiere no compartir contacto
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <button className={s.verMasBtn} onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                Ver más estudiantes ({filtered.length - visibleCount} restantes)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
