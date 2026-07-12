import { useNavigate, useLocation } from 'react-router-dom'
import { Car, LayoutDashboard, Users, LogOut, Route, Map } from 'lucide-react'
import s from './Navbar.module.css'

export default function Navbar({ usuario, onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard size={15} /> },
    { path: '/matches', label: 'Matches', icon: <Users size={15} /> },
    { path: '/viajes', label: 'Viajes', icon: <Route size={15} /> },
    { path: '/mapa', label: 'Mapa', icon: <Map size={15} /> },
  ]

  return (
    <nav className={s.nav}>
      <div className={s.inner}>
        {/* Logo */}
        <div className={s.logo} onClick={() => navigate('/dashboard')}>
          <div className={s.logoBox}>
            <Car size={15} color="white" />
          </div>
          <span className={s.logoText}>Carpool Ulima</span>
        </div>

        {/* Links */}
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className={pathname === l.path ? `${s.link} ${s.linkActive}` : s.link}
          >
            {l.icon} {l.label}
          </button>
        ))}

        <div className={s.spacer} />

        {/* User info */}
        <div className={s.user}>
          <div className={s.userInfo}>
            <div className={s.userName}>{usuario.nombre_completo?.split(' ')[0]}</div>
            <div className={s.userType}>{usuario.tipo_usuario}</div>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" className={s.logout}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
