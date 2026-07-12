import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, MapPin, Shield, ArrowRight, Leaf, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import s from './Landing.module.css'

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
    supabase.rpc('estadisticas_publicas')
      .then(({ data }) => {
        if (!data) return
        setStats({ total: data.total, conductores: data.conductores, distritos: data.distritos })
      })
      .catch(() => {})
  }, [])

  return (
    <div className={s.page}>
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.brand}>
            <div className={s.brandBox}>
              <Car size={16} color="white" />
            </div>
            <span className={s.brandName}>Carpool Ulima</span>
          </div>
          <div className={s.headerBtns}>
            <button onClick={() => navigate('/login')} className={s.loginBtn}>
              <LogIn size={14} /> Ingresar
            </button>
            <button onClick={() => navigate('/registro')} className={s.joinBtn}>
              Únete
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className={s.heroInner}>
          <div className={s.heroLeft}>
            <div className={s.badge}><Leaf size={13} /> Universidad de Lima · Solo estudiantes</div>
            <h1 className={s.h1}>
              Comparte el camino<br />
              <span className={s.h1Accent}>hacia la Ulima</span>
            </h1>
            <p className={s.subtitle}>
              Conectamos a estudiantes de la Universidad de Lima para compartir viajes y reducir costos. Encuentra compañeros de carpool de tu mismo distrito.
            </p>
            <div className={s.btnRow}>
              <button className={s.btnPrimary} onClick={() => navigate('/registro')}>
                Registrarme <ArrowRight size={16} />
              </button>
              <button className={s.btnSecondary} onClick={() => navigate('/registro?tipo=conductor')}>
                Soy conductor
              </button>
            </div>
          </div>

          <div className={s.heroRight}>
            <div className={s.heroCard}>
              <div className={s.heroCardHeader}>
                <div className={s.heroCardIcon}>
                  <Car size={18} color="var(--accent)" />
                </div>
                <div>
                  <div className={s.heroCardTitle}>Miraflores → Ulima</div>
                  <div className={s.heroCardSub}>Estudiantes disponibles</div>
                </div>
                <div className={s.heroMatchBadge}>Match</div>
              </div>
              <div className={s.heroList}>
                {['Surco', 'San Borja', 'Miraflores'].map((d, i) => (
                  <div key={d} className={s.heroRow}>
                    <div className={s.heroAvatar} style={{ background: `hsl(${140 + i * 20}, 40%, ${80 - i * 5}%)` }}>{d[0]}</div>
                    <div>
                      <div className={s.heroRowTitle}>Estudiante · {d}</div>
                      <div className={s.heroRowSub}>Pasajero · 7:00 am</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={s.statsRow}>
                <div className={s.statBox}>
                  <span className={s.statNum}>{stats.total || '–'}</span>
                  <span className={s.statLabel}>Usuarios activos</span>
                </div>
                <div className={s.statBox}>
                  <span className={s.statNum}>{stats.distritos || '–'}</span>
                  <span className={s.statLabel}>Distritos</span>
                </div>
                <div className={s.statBox}>
                  <span className={s.statNum}>{stats.conductores || '–'}</span>
                  <span className={s.statLabel}>Conductores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={s.sectionWrap}>
        <div className={s.sectionTitle}>
          <h2 className={s.sectionH2}>¿Por qué Carpool Ulima?</h2>
          <p className={s.sectionSub}>Una plataforma pensada exclusivamente para la comunidad universitaria</p>
        </div>
        <div className={s.featuresGrid}>
          {features.map(f => (
            <div key={f.title} className={s.featureCard}>
              <div className={s.featureIcon}>{f.icon}</div>
              <div className={s.featureTitle}>{f.title}</div>
              <div className={s.featureText}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={s.howBand}>
        <div className={s.howSection}>
          <div className={s.sectionTitle}>
            <h2 className={s.sectionH2}>¿Cómo funciona?</h2>
            <p className={s.sectionSub}>En tres pasos ya puedes conectar con compañeros</p>
          </div>
          <div className={s.howSteps}>
            {[
              { n: '1', t: 'Regístrate', d: 'Crea tu cuenta con tu correo @aloe.ulima.edu.pe y código de alumno de 8 dígitos.' },
              { n: '2', t: 'Completa tu perfil', d: 'Indica tu distrito, horario y si eres conductor o pasajero.' },
              { n: '3', t: 'Encuentra tu match', d: 'Explora estudiantes de tu mismo distrito y coordina por WhatsApp.' },
            ].map(step => (
              <div key={step.n} className={s.stepItem}>
                <div className={s.stepNum}>{step.n}</div>
                <div className={s.stepTitle}>{step.t}</div>
                <div className={s.stepText}>{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaBanner}>
        <div className={s.ctaInner}>
          <h2 className={s.ctaH2}>¿Listo para compartir el camino?</h2>
          <p className={s.ctaP}>
            Únete a la comunidad de Carpool Ulima y empieza a coordinar tus viajes hoy mismo.
          </p>
          <div className={s.ctaBtnRow}>
            <button className={s.ctaBtn} onClick={() => navigate('/registro')}>
              Crear mi cuenta <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className={s.ctaSecondaryBtn}>
              <LogIn size={16} /> Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        © 2026 Carpool Ulima · Grupo 8 · Universidad de Lima · Proyecto académico
      </footer>
    </div>
  )
}
