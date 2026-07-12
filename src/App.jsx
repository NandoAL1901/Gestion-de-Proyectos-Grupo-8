import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Navbar from './components/Navbar'
import { supabase } from './lib/supabase'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('usuarios').select('*').eq('id', session.user.id).eq('activo', true).single()
          .then(({ data }) => { if (data) setUsuario(data) })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios de autenticación (cierre de sesión, expiración)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUsuario(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = (perfil) => setUsuario(perfil)

  const logout = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  const updateUsuario = (updated) => setUsuario(updated)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ color: 'var(--medium)', fontSize: '14px' }}>Cargando...</div>
    </div>
  )

  return (
    <BrowserRouter>
      {usuario && <Navbar usuario={usuario} onLogout={logout} />}
      <Routes>
        <Route path="/" element={!usuario ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!usuario ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/registro" element={!usuario ? <Registro onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={usuario ? <Dashboard usuario={usuario} onUpdate={updateUsuario} onLogout={logout} /> : <Navigate to="/" />} />
        <Route path="/matches" element={usuario ? <Matches usuario={usuario} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
