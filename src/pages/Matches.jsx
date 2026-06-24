import React, { useState, useEffect } from 'react'
import { MapPin, Car, User, Phone, Clock, Search, PhoneOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { HORARIOS } from '../lib/constants'

const styles = {
  page: { minHeight: 'calc(100vh - 60px)', background: 'var(--cream)', padding: '32px 16px 60px' },
  inner: { maxWidth: '900px', margin: '0 auto' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', marginBottom: '6px' },
  subtitle: { color: 'var(--medium)', fontSize: '14px', fontWeight: '300' },
  filters: {
    display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px',
    background: 'white', padding: '16px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', alignItems: 'flex-end',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '130px' },
  filterLabel: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--medium)' },
  select: {
    padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
    fontSize: '13px', color: 'var(--charcoal)', background: 'white', outline: 'none', cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B67' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px',
  },
  myDistrictBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
    background: 'var(--accent)', color: 'white', border: 'none',
    borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' },
  card: {
    background: 'white', borderRadius: 'var(--radius)', padding: '20px',
    border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)',
    transition: 'box-shadow var(--transition), transform var(--transition)', cursor: 'default',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  cardName: { fontWeight: '600', fontSize: '14px', marginBottom: '2px' },
  cardCarrera: { fontSize: '11px', color: 'var(--medium)', lineHeight: '1.4' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', marginLeft: 'auto', flexShrink: 0 },
  badgeConductor: { background: '#E8F5EF', color: 'var(--accent)' },
  badgePasajero: { background: '#EFF6FF', color: '#2563EB' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--medium)', marginBottom: '6px' },
  divider: { height: '1px', background: 'var(--border)', margin: '14px 0' },
  contactBtn: {
    width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'white', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', color: 'var(--charcoal)', transition: 'all var(--transition)', textDecoration: 'none',
  },
  noContactMsg: {
    width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'var(--cream)', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--medium)',
  },
  matchBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', marginTop: '4px' },
  horarioBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#E8F5EF', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', marginTop: '4px' },
  bioText: { fontSize: '11px', color: 'var(--medium)', fontStyle: 'italic', marginTop: '6px', lineHeight: '1.5' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: 'var(--medium)' },
  loading: { textAlign: 'center', padding: '40px', color: 'var(--medium)', fontSize: '14px' },
  verMasBtn: {
    display: 'block', margin: '24px auto 0', padding: '12px 32px',
    background: 'white', color: 'var(--charcoal)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
    transition: 'all var(--transition)',
  },
}

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
    setLoading(true)
    supabase
      .from('usuarios')
      .select('id, nombre_completo, carrera, distrito, tipo_usuario, horario_entrada, horario_salida, telefono, modelo_auto, asientos_disponibles, bio, mostrar_telefono, created_at')
      .eq('activo', true)
      .eq('distrito', usuario.distrito)
      .neq('id', usuario.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setUsuarios(data)
      })
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false))
  }, [usuario.id, usuario.distrito])

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [filtroTipo, filtroHorario])

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
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <h1 style={styles.title}>Compañeros de carpool</h1>
          <p style={styles.subtitle}>
            Estudiantes de <strong>{usuario.distrito}</strong> que buscan compartir el viaje a la Ulima
          </p>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={styles.select}>
              <option value="todos">Todos</option>
              <option value="conductor">Conductores</option>
              <option value="pasajero">Pasajeros</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Horario de entrada</label>
            <select value={filtroHorario} onChange={e => setFiltroHorario(e.target.value)} style={styles.select}>
              <option value="">Todos los horarios</option>
              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <button style={styles.myDistrictBtn} onClick={() => setFiltroHorario(usuario.horario_entrada || '')}>
            <Clock size={13} /> Mi horario
          </button>
        </div>

        {/* Count */}
        <div style={{ fontSize: '13px', color: 'var(--medium)', marginBottom: '16px' }}>
          {loading ? '' : `${filtered.length} estudiante${filtered.length !== 1 ? 's' : ''} de ${usuario.distrito}${filtroHorario ? ` · ${filtroHorario}` : ''}`}
        </div>

        {loading ? (
          <div style={styles.loading}>Cargando estudiantes...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <Search size={32} color="var(--border)" style={{ marginBottom: '12px' }} />
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>Sin resultados</div>
            <div style={{ fontSize: '13px' }}>No hay estudiantes con estos filtros. Intenta cambiar el distrito o tipo.</div>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {visible.map(u => (
                <div
                  key={u.id}
                  style={styles.card}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--card-shadow)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={styles.cardTop}>
                    <div style={{ ...styles.avatar, ...getAvatarStyle(u.nombre_completo) }}>
                      {getInitials(u.nombre_completo).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.cardName}>{u.nombre_completo}</div>
                      <div style={styles.cardCarrera}>{u.carrera}</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {u.distrito === usuario.distrito && (
                          <div style={styles.matchBadge}>✦ Mismo distrito</div>
                        )}
                        {mismoHorario(u) && (
                          <div style={styles.horarioBadge}>⏰ Mismo horario</div>
                        )}
                      </div>
                    </div>
                    <div style={{ ...styles.badge, ...(u.tipo_usuario === 'conductor' ? styles.badgeConductor : styles.badgePasajero) }}>
                      {u.tipo_usuario === 'conductor' ? <Car size={10} /> : <User size={10} />}
                      {u.tipo_usuario}
                    </div>
                  </div>

                  <div style={styles.infoRow}><MapPin size={12} color="var(--accent)" />{u.distrito}</div>
                  <div style={styles.infoRow}>
                    <Clock size={12} color="var(--medium)" />
                    {u.horario_entrada}{u.horario_salida ? ` – ${u.horario_salida}` : ''}
                  </div>
                  {u.tipo_usuario === 'conductor' && u.modelo_auto && (
                    <div style={styles.infoRow}>
                      <Car size={12} color="var(--medium)" />
                      {u.modelo_auto}{u.asientos_disponibles ? ` · ${u.asientos_disponibles} asiento(s)` : ''}
                    </div>
                  )}
                  {u.bio && <div style={styles.bioText}>"{u.bio}"</div>}

                  <div style={styles.divider} />

                  {u.mostrar_telefono !== false ? (
                    <a
                      href={`https://wa.me/51${u.telefono?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.contactBtn}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)' }}
                    >
                      <Phone size={13} /> Contactar por WhatsApp
                    </a>
                  ) : (
                    <div style={styles.noContactMsg}>
                      <PhoneOff size={13} /> Prefiere no compartir contacto
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                style={styles.verMasBtn}
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)' }}
              >
                Ver más estudiantes ({filtered.length - visibleCount} restantes)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
