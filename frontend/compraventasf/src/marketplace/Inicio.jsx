import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import PuestoCard from '../components/puestos/PuestoCard.jsx'
import { puestos } from '../data/puestos.js'
import './pages.css'
import './puestos.css'

const CATEGORIAS = [
  { label: 'Libros', emoji: '📚' },
  { label: 'Electrónica', emoji: '💻' },
  { label: 'Ropa', emoji: '👕' },
  { label: 'Útiles', emoji: '✏️' },
  { label: 'Deporte', emoji: '⚽' },
  { label: 'Instrumentos', emoji: '🎸' },
  { label: 'Otros', emoji: '📦' },
]

export default function Inicio() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function buscar(event) {
    event.preventDefault()
    navigate(`/explorar?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <section className="hero">
        <p>Universidad Veracruzana</p>
        <h2>Compra y vende</h2>
        <span>Conectando a la comunidad UV</span>
        <form className="hero__search" onSubmit={buscar}>
          <label>
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar libros, electrónica, ropa..."
            />
          </label>
          <button type="submit">Buscar</button>
        </form>
      </section>

      <h3 className="section-title">Categorías</h3>
      <div className="categorias">
        {CATEGORIAS.map((c) => (
          <Link key={c.label} to="/explorar" className="categoria">
            <span>{c.emoji}</span>
            {c.label}
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h3 className="section-title">Puestos UV destacados</h3>
        <Link to="/puestos">Ver todos</Link>
      </div>
      <section className="puestos-grid">
        {puestos.map((puesto) => (
          <PuestoCard key={puesto.id} puesto={puesto} />
        ))}
      </section>
    </>
  )
}