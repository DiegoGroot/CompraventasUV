import { useState } from 'react'
import { Package } from 'lucide-react'
import { compras } from '../data/compras.js'
import './pages.css'

const ESTADOS = {
  entregado: 'Entregado',
  'en-camino': 'En camino',
  pendiente: 'Pendiente',
}

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'en-camino', label: 'En camino' },
  { id: 'entregado', label: 'Entregadas' },
]

export default function MisCompras() {
  const [filtro, setFiltro] = useState('todas')
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
              {c.imagen ? <img src={c.imagen} alt="" /> : <Package size={28} />}
            </div>
            <div className="compra__info">
              <h3>{c.titulo}</h3>
              <p>Vendedor: {c.vendedor} · {c.fecha}</p>
            </div>
            <span className={`estado estado--${c.estado}`}>{ESTADOS[c.estado]}</span>
            <strong className="compra__precio">{c.precio} €</strong>
          </article>
        ))}
        {visibles.length === 0 && <p className="page-count">No hay compras en esta categoría.</p>}
      </section>
    </>
  )
}