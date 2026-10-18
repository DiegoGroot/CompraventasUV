import { NavLink } from 'react-router-dom'
import {
  House, Search, Store, Heart, ShoppingCart, ShoppingBag,
  MessageSquareText, Warehouse, User, Plus,
} from 'lucide-react'
import { useUser } from '../../context/UserContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/explorar', label: 'Explorar', icon: Search },
  { to: '/puestos', label: 'Puestos', icon: Store },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/carrito', label: 'Carrito', icon: ShoppingCart },
  { to: '/mis-compras', label: 'Mis compras', icon: ShoppingBag },
  { to: '/mensajes', label: 'Mensajes', icon: MessageSquareText, badge: 2 },
  { to: '/mi-espacio', label: 'Mi espacio', icon: Warehouse },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export default function Sidebar({ onPublish }) {
  const { user, initials } = useUser()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">UV</div>
        <div>
          <strong>Compraventas</strong>
          <span>Universidad Veracruzana</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
          >
            <span className="sidebar__icon">
              <Icon size={24} strokeWidth={1.6} />
              {badge && <span className="sidebar__badge">{badge}</span>}
            </span>
            <span className="sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__publish" type="button" onClick={onPublish} title="Publicar">
          <Plus size={22} />
          <span className="sidebar__label">Publicar</span>
        </button>

        {user && (
          <div className="sidebar__user">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user.nombre.split(' ').slice(0, 2).join(' ')}</strong>
              <span>{user.facultad} · {user.campus}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}