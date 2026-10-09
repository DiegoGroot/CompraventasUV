import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { usePreferences } from '../../context/PreferencesContext.jsx'
import { useUser } from '../../context/UserContext.jsx'

export default function Topbar({ title, onSignIn }) {
  const { collapsed, toggleCollapsed } = usePreferences()
  const { user, initials } = useUser()

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
        </button>
        <h1>{title}</h1>
      </div>

      <div className="topbar__actions">
        {user ? (
          <div className="avatar">{initials}</div>
        ) : (
          <button type="button" className="topbar__signin" onClick={onSignIn}>
            Entrar
          </button>
        )}
      </div>
    </header>
  )
}