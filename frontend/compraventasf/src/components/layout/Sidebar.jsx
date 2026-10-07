import { NavLink } from 'react-router-dom'
import {
  House, Search, Store, Heart, ShoppingCart, ShoppingBag,
  MessageSquareText, Warehouse, User, Plus,
} from 'lucide-react'

// Hardcodeado por ahora; luego vendrá del backend
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

const USER = { initials: 'MR', name: 'María Ramírez', detail: 'Medicina · Xalapa' }

export default function Sidebar({ onPublish }) {
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
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="sidebar__icon">
              <Icon size={24} strokeWidth={1.6} />
              {badge && <span className="sidebar__badge">{badge}</span>}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__publish" type="button" onClick={onPublish}>
          <Plus size={22} /> Publicar
        </button>

        <div className="sidebar__user">
          <div className="avatar">{USER.initials}</div>
          <div>
            <strong>{USER.name}</strong>
            <span>{USER.detail}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}