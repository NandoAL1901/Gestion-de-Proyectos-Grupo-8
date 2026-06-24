import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, MapPin, Shield, ArrowRight, Leaf, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)', overflowX: 'hidden' },
  heroInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 24px 60px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '48px',
    alignItems: 'center',
  },
  heroLeft: { flex: '1 1 300px' },
  heroRight: { flex: '1 1 300px' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  h1: { fontSize: 'clamp(32px, 5vw, 54px)', color: 'var(--charcoal)', marginBottom: '20px', letterSpacing: '-0.5px' },
  h1Accent: { color: 'var(--accent)', fontStyle: 'italic' },
  subtitle: { fontSize: '17px', color: 'var(--medium)', marginBottom: '36px', lineHeight: '1.7', fontWeight: '300' },
  btnRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--charcoal)', color: 'white',
    padding: '14px 28px', borderRadius: 'var(--radius)',
    border: 'none', fontSize: '15px', fontWeight: '500', cursor: 'pointer',
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'transparent', color: 'var(--charcoal)',
    padding: '14px 28px', borderRadius: 'var(--radius)',
    border: '1.5px solid var(--border)', fontSize: '15px', fontWeight: '500', cursor: 'pointer',
  },
  heroCard: {
    background: 'white', borderRadius: '20px', padding: '28px',
    boxShadow: 'var(--card-shadow)', border: '1px solid var(--border)',
  },
  statsRow: { display: 'flex', gap: '12px', marginTop: '16px' },
  statBox: {
    flex: 1, background: 'var(--cream)', borderRadius: 'var(--radius)',
    padding: '14px', textAlign: 'center',
  },
  statNum: { fontSize: '26px', fontFamily: 'DM Serif Display, serif', color: 'var(--accent)', display: 'block' },
  statLabel: { fontSize: '11px', color: 'var(--medium)', marginTop: '2px' },
  sectionWrap: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' },
  sectionTitle: { textAlign: 'center', marginBottom: '48px' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  featureCard: {
    background: 'white', borderRadius: 'var(--radius)', padding: '28px 24px', border: '1px solid var(--border)',
  },
  featureIcon: {
    width: '44px', height: '44px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  ctaBanner: { background: 'var(--charcoal)', padding: '64px 24px' },
  ctaInner: { maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
  ctaBtn: {
    background: 'var(--accent)', color: 'white', padding: '16px 36px',
    borderRadius: 'var(--radius)', border: 'none', fontSize: '16px', fontWeight: '500',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  howSection: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' },
  howSteps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0' },
  stepItem: { textAlign: 'center', padding: '20px' },
  stepNum: {
    width: '48px', height: '48px', background: 'var(--accent)', color: 'white',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontFamily: 'DM Serif Display, serif', margin: '0 auto 16px',
  },
  footer: {
    background: 'var(--cream)', borderTop: '1px solid var(--border)',
    padding: '24px', textAlign: 'center', color: 'var(--medium)', fontSize: '13px',
  },
}

const features = [
  { icon: <Users size={20} color="var(--accent)" />, title: 'Solo universitarios', text: 'Exclusivo para estudiantes de la Universidad de Lima con correo institucional verificado.' },
  { icon: <MapPin size={20} color="var(--accent)" />, title: 'Matching por distrito', text: 'Encontramos compañeros de carpool que viven cerca de ti, según tu distrito de residencia.' },
  { icon: <Car size={20} color="var(--accent)" />, title: 'Conductores y pasajeros', text: 'Regístrate como conductor si tienes auto, o como pasajero si necesitas el servicio.' },
  { icon: <Shield size={20} color="var(--accent)" />, title: 'Comunidad confiable', text: 'Todos los usuarios son verificados con su código de alumno de 8 dígitos.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, conductores: 0, distritos: 0 })

  useEffect(() => {
    supabase.from('usuarios').select('tipo_usuario, distrito').eq('activo', true)
      .then(({ data }) => {
        if (!data) return
        const conductores = data.filter(u => u.tipo_usuario === 'conductor').length
        const distritos = new Set(data.map(u => u.distrito)).size
        setStats({ total: data.length, conductores, distritos })
      })
      .catch(() => {})
  }, [])

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '18px', letterSpacing: '-0.3px' }}>Carpool Ulima</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', color: 'var(--charcoal)', border: '1.5px solid var(--border)', padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={14} /> Ingresar
            </button>
            <button
              onClick={() => navigate('/registro')}
              style={{ background: 'var(--charcoal)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              Únete
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}><Leaf size={13} /> Universidad de Lima · Solo estudiantes</div>
            <h1 style={styles.h1}>
              Comparte el camino<br />
              <span style={styles.h1Accent}>hacia la Ulima</span>
            </h1>
            <p style={styles.subtitle}>
              Conectamos a estudiantes de la Universidad de Lima para compartir viajes y reducir costos. Encuentra compañeros de carpool de tu mismo distrito.
            </p>
            <div style={styles.btnRow}>
              <button style={styles.btnPrimary} onClick={() => navigate('/registro')}>
                Registrarme <ArrowRight size={16} />
              </button>
              <button style={styles.btnSecondary} onClick={() => navigate('/registro?tipo=conductor')}>
                Soy conductor
              </button>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Miraflores → Ulima</div>
                  <div style={{ fontSize: '12px', color: 'var(--medium)' }}>Estudiantes disponibles</div>
                </div>
                <div style={{ marginLeft: 'auto', background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Match</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Surco', 'San Borja', 'Miraflores'].map((d, i) => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: '28px', height: '28px', background: `hsl(${140 + i * 20}, 40%, ${80 - i * 5}%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--accent)' }}>{d[0]}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>Estudiante · {d}</div>
                      <div style={{ fontSize: '11px', color: 'var(--medium)' }}>Pasajero · 7:00 am</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <span style={styles.statNum}>{stats.total || '–'}</span>
                  <span style={styles.statLabel}>Usuarios activos</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statNum}>{stats.distritos || '–'}</span>
                  <span style={styles.statLabel}>Distritos</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statNum}>{stats.conductores || '–'}</span>
                  <span style={styles.statLabel}>Conductores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.sectionWrap}>
        <div style={styles.sectionTitle}>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', marginBottom: '10px' }}>¿Por qué Carpool Ulima?</h2>
          <p style={{ color: 'var(--medium)', fontWeight: '300' }}>Una plataforma pensada exclusivamente para la comunidad universitaria</p>
        </div>
        <div style={styles.featuresGrid}>
          {features.map(f => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: 'var(--medium)', lineHeight: '1.6' }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'white', padding: '80px 0' }}>
        <div style={styles.howSection}>
          <div style={styles.sectionTitle}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', marginBottom: '10px' }}>¿Cómo funciona?</h2>
            <p style={{ color: 'var(--medium)', fontWeight: '300' }}>En tres pasos ya puedes conectar con compañeros</p>
          </div>
          <div style={styles.howSteps}>
            {[
              { n: '1', t: 'Regístrate', d: 'Crea tu cuenta con tu correo @aloe.ulima.edu.pe y código de alumno de 8 dígitos.' },
              { n: '2', t: 'Completa tu perfil', d: 'Indica tu distrito, horario y si eres conductor o pasajero.' },
              { n: '3', t: 'Encuentra tu match', d: 'Explora estudiantes de tu mismo distrito y coordina por WhatsApp.' },
            ].map(s => (
              <div key={s.n} style={styles.stepItem}>
                <div style={styles.stepNum}>{s.n}</div>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '15px' }}>{s.t}</div>
                <div style={{ fontSize: '13px', color: 'var(--medium)', lineHeight: '1.6' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaInner}>
          <h2 style={{ color: 'white', fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '16px' }}>¿Listo para compartir el camino?</h2>
          <p style={{ color: 'var(--light)', fontSize: '16px', marginBottom: '32px', fontWeight: '300' }}>
            Únete a la comunidad de Carpool Ulima y empieza a coordinar tus viajes hoy mismo.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={styles.ctaBtn} onClick={() => navigate('/registro')}>
              Crear mi cuenta <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', padding: '16px 36px', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <LogIn size={16} /> Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        © 2026 Carpool Ulima · Grupo 8 · Universidad de Lima · Proyecto académico
      </footer>
    </div>
  )
}
