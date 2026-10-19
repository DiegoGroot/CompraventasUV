import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductCard from '../components/catalog/ProductCard.jsx'
import ProductDialog from '../components/catalog/ProductDialog.jsx'
import { useUser } from '../context/UserContext.jsx'
import { socialService } from '../services/social.js'
import { aVistaProducto } from '../services/vistaProducto.js'
import './marketplace.css'
import './pages.css'

export default function Favoritos() {
  const { user } = useUser()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setItems(await socialService.catalogo(true))
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) cargar()
    else setCargando(false)
  }, [user, cargar])

  const favoritos = useMemo(() => items.map(aVistaProducto), [items])

  async function quitar(productId) {
    try {
      await socialService.alternarFavorito(productId)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!user) return <p className="page-count">Inicia sesión con el botón «Entrar» para ver tus favoritos.</p>
  if (cargando) return <p className="page-count">Cargando…</p>
  if (error) return <p className="page-count" role="alert">{error}</p>

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
            onOpen={() => setSelectedProduct(product)}
            onToggleSaved={() => quitar(product.id)}
          />
        ))}
      </section>
      {selectedProduct && (
        <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onChanged={cargar} />
      )}
    </>
  )
}