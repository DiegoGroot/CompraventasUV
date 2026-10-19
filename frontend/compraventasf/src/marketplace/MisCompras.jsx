import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { socialService } from '../services/social.js'
import { imgUrl } from '../services/media.js'
import './pages.css'

const ESTADOS = {
  pendiente: 'Pendiente',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const CLASE = {
  pendiente: 'pendiente',
  en_camino: 'en-camino',
  entregado: 'entregado',
  cancelado: 'pendiente',
}

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'en_camino', label: 'En camino' },
  { id: 'entregado', label: 'Entregadas' },
]

const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MisCompras() {
  const { user } = useUser()
  const [filtro, setFiltro] = useState('todas')
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setCargando(false)
      return
    }
    socialService
      .misCompras()
      .then(setCompras)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [user])

  if (!user) return <p className="page-count">Inicia sesión para ver tus compras.</p>
  if (cargando) return <p className="page-count">Cargando…</p>
  if (error) return <p className="page-count" role="alert">{error}</p>

  const visibles = compras.filter((c) => filtro === 'todas' || c.estado === filtro)

  return (
    <>
      <div className="tabs">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filtro === f.id ? 'is-active' : ''}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="compras-list">
        {visibles.map((c) => (
          <article key={c.id} className="compra">
            <div className="compra__img">
              {c.imagen ? <img src={imgUrl(c.imagen)} alt="" /> : <Package size={28} />}
            </div>
            <div className="compra__info">
              <h3>{c.nombre_producto}{c.cantidad > 1 ? ` ×${c.cantidad}` : ''}</h3>
              <p>Vendedor: {c.contraparte} · {fecha(c.fecha_compra)}</p>
            </div>
            <span className={`estado estado--${CLASE[c.estado]}`}>{ESTADOS[c.estado]}</span>
            <strong className="compra__precio">{dinero(c.precio_unitario * c.cantidad)}</strong>
          </article>
        ))}
        {visibles.length === 0 && <p className="page-count">No hay compras en esta categoría.</p>}
      </section>
    </>
  )
}