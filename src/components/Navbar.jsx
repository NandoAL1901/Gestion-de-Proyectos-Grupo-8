import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Car, LayoutDashboard, Users, LogOut } from 'lucide-react'

export default function Navbar({ usuario, onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard size={15} /> },
    { path: '/matches', label: 'Matches', icon: <Users size={15} /> },
  ]

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '60px',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        gap: '8px',
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '16px' }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{ width: '30px', height: '30px', background: 'var(--accent)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={15} color="white" />
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '17px', letterSpacing: '-0.2px' }}>Carpool Ulima</span>
        </div>

        {/* Links */}
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: pathname === l.path ? 'var(--accent-light)' : 'transparent',
              color: pathname === l.path ? 'var(--accent)' : 'var(--medium)',
              fontSize: '13px',
              fontWeight: pathname === l.path ? '600' : '400',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            {l.icon} {l.label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', lineHeight: 1.2 }}>{usuario.nombre_completo?.split(' ')[0]}</div>
            <div style={{ fontSize: '10px', color: 'var(--medium)', textTransform: 'capitalize' }}>{usuario.tipo_usuario}</div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--medium)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--medium)' }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
