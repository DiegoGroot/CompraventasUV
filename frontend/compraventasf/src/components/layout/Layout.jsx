import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import AuthDialog from '../auth/AuthDialog.jsx'
import './Layout.css'

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
  const { pathname } = useLocation()
  const [authMode, setAuthMode] = useState(null)

  return (
    <div className="layout">
      <Sidebar onPublish={() => setAuthMode('register')} />
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