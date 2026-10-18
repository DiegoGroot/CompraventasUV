import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductCard from '../components/catalog/ProductCard.jsx'
import { products } from '../data/products.js'
import './marketplace.css'
import './pages.css'

// Hardcodeado: los 3 primeros productos como favoritos
const favoritos = products.slice(0, 3)

export default function Favoritos() {
  if (favoritos.length === 0) {
    return (
      <div className="vacio">
        <Heart size={48} strokeWidth={1.4} />
        <h2>Aún no tienes favoritos</h2>
        <p>Guarda artículos con el corazón para verlos aquí.</p>
        <Link to="/explorar">Explorar artículos</Link>
      </div>
    )
  }

  return (
    <>
      <p className="page-count">{favoritos.length} artículos guardados</p>
      <section className="product-grid" aria-label="Favoritos">
        {favoritos.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSaved
            onOpen={() => {}}
            onToggleSaved={() => {}}
          />
        ))}
      </section>
    </>
  )
}