import { useCallback, useEffect, useMemo, useState } from 'react'
import CatalogFilters from '../components/catalog/CatalogFilters.jsx'
import ProductCard from '../components/catalog/ProductCard.jsx'
import ProductDialog from '../components/catalog/ProductDialog.jsx'
import { useUser } from '../context/UserContext.jsx'
import { socialService } from '../services/social.js'
import { aVistaProducto } from '../services/vistaProducto.js'

import './marketplace.css'

export default function Explorar() {
  const { user } = useUser()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCampus, setSelectedCampus] = useState('all')
  const [sortOrder, setSortOrder] = useState('recent')
  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setItems(await socialService.catalogo())
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

  const productos = useMemo(() => items.map(aVistaProducto), [items])

  const categories = useMemo(
    () => [
      { id: 'all', label: 'Todo' },
      ...[...new Set(productos.map((p) => p.category).filter(Boolean))].map((c) => ({ id: c, label: c })),
    ],
    [productos],
  )

  const campuses = useMemo(
    () => [...new Set(productos.map((p) => p.campus).filter(Boolean))],
    [productos],
  )

  const normalizedSearch = searchValue.trim().toLocaleLowerCase('es')
  const visibleProducts = productos
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .filter((p) => selectedCampus === 'all' || p.campus === selectedCampus)
    .filter((p) => !savedOnly || p.saved)
    .filter((p) => `${p.title} ${p.description} ${p.category}`.toLocaleLowerCase('es').includes(normalizedSearch))
    .sort((a, b) => {
      if (sortOrder === 'price-low') return a.price - b.price
      if (sortOrder === 'price-high') return b.price - a.price
      return productos.indexOf(a) - productos.indexOf(b)
    })

  async function toggleSaved(productId) {
    setItems((cur) => cur.map((p) => (p.id === productId ? { ...p, favorito: !p.favorito } : p)))
    try {
      await socialService.alternarFavorito(productId)
    } catch (e) {
      setError(e.message)
      cargar()
    }
  }

  if (!user) return <p className="page-count">Inicia sesión con el botón «Entrar» para ver los artículos.</p>
  if (cargando) return <p className="page-count">Cargando…</p>

  return (
    <div className="marketplace-app">
      <main className="marketplace-main">
        <div className="market-heading">
          <div>
            <p className="market-eyebrow">Compra y vende entre estudiantes</p>
            <h2>El mercado de la UV</h2>
          </div>
          <span className="market-total">{visibleProducts.length} artículos</span>
        </div>

        <input
          className="explorar-search"
          type="search"
          placeholder="Buscar artículos..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        <CatalogFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          campuses={campuses}
          selectedCampus={selectedCampus}
          onCampusChange={setSelectedCampus}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          savedCount={productos.filter((p) => p.saved).length}
          savedOnly={savedOnly}
          onSavedOnlyChange={() => setSavedOnly((current) => !current)}
        />

        {error && <p role="alert" style={{ color: '#b3261e' }}>{error}</p>}

        {visibleProducts.length > 0 ? (
          <section className="product-grid" aria-label="Artículos disponibles">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={product.saved}
                onOpen={() => setSelectedProduct(product)}
                onToggleSaved={() => toggleSaved(product.id)}
              />
            ))}
          </section>
        ) : (
          <div className="empty-state">
            <h2>No encontramos artículos</h2>
            <p>Prueba otra búsqueda o cambia los filtros.</p>
            <button
              type="button"
              onClick={() => {
                setSearchValue('')
                setSelectedCategory('all')
                setSelectedCampus('all')
                setSavedOnly(false)
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onChanged={cargar} />
      )}
    </div>
  )
}