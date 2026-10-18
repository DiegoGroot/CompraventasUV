import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import AuthDialog from '../auth/AuthDialog.jsx'
import './Layout.css'
import { usePreferences } from '../../context/PreferencesContext.jsx'

const TITLES = {
  '/': 'Inicio',
  '/explorar': 'Explorar',
  '/puestos': 'Puestos UV',
  '/favoritos': 'Favoritos',
  '/carrito': 'Carrito',
  '/mis-compras': 'Mis compras',
  '/mensajes': 'Mensajes',
  '/mi-espacio': 'Mi espacio',
  '/perfil': 'Perfil',
}

export default function Layout() {
  const { collapsed } = usePreferences()
  const { pathname } = useLocation()
  const [authMode, setAuthMode] = useState(null)
    const navigate = useNavigate()
  const { user } = useUser()


  return (
    <div className={`layout ${collapsed ? 'is-collapsed' : ''}`}>
    <Sidebar onPublish={() => (user ? navigate('/mi-espacio') : setAuthMode('login'))} />
      <div className="layout__main">
        <Topbar title={TITLES[pathname] ?? ''} onSignIn={() => setAuthMode('login')} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      {authMode && <AuthDialog initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}