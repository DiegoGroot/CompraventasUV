import { useState } from 'react'
import AuthDialog from '../components/auth/AuthDialog.jsx'
import CatalogFilters from '../components/catalog/CatalogFilters.jsx'
import ProductCard from '../components/catalog/ProductCard.jsx'
import ProductDialog from '../components/catalog/ProductDialog.jsx'
import SiteHeader from '../components/site/SiteHeader.jsx'
import { campuses, categories, products } from '../data/products.js'

import './marketplace.css'

function App() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCampus, setSelectedCampus] = useState('all')
  const [sortOrder, setSortOrder] = useState('recent')
  const [savedIds, setSavedIds] = useState([])
  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [authMode, setAuthMode] = useState(null)

  const normalizedSearch = searchValue.trim().toLocaleLowerCase('es')
  const visibleProducts = products
    .filter((product) => selectedCategory === 'all' || product.category === selectedCategory)
    .filter((product) => selectedCampus === 'all' || product.campus === selectedCampus)
    .filter((product) => !savedOnly || savedIds.includes(product.id))
    .filter((product) => {
      const categoryName = categories.find((category) => category.id === product.category)?.label || ''
      return `${product.title} ${product.description} ${categoryName}`.toLocaleLowerCase('es').includes(normalizedSearch)
    })
    .sort((first, second) => {
      if (sortOrder === 'price-low') return first.price - second.price
      if (sortOrder === 'price-high') return second.price - first.price
      return products.indexOf(first) - products.indexOf(second)
    })

  function toggleSaved(productId) {
    setSavedIds((currentIds) => currentIds.includes(productId) ? currentIds.filter((id) => id !== productId) : [...currentIds, productId])
  }

  function startContact() {
    setSelectedProduct(null)
    setAuthMode('login')
  }

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

        <CatalogFilters categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} campuses={campuses} selectedCampus={selectedCampus} onCampusChange={setSelectedCampus} sortOrder={sortOrder} onSortChange={setSortOrder} savedCount={savedIds.length} savedOnly={savedOnly} onSavedOnlyChange={() => setSavedOnly((current) => !current)} />

        {visibleProducts.length > 0 ? (
          <section className="product-grid" aria-label="Artículos disponibles">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} isSaved={savedIds.includes(product.id)} onOpen={() => setSelectedProduct(product)} onToggleSaved={() => toggleSaved(product.id)} />)}
          </section>
        ) : (
          <div className="empty-state">
            <h2>No encontramos artículos</h2>
            <p>Prueba otra búsqueda o cambia los filtros.</p>
            <button type="button" onClick={() => { setSearchValue(''); setSelectedCategory('all'); setSelectedCampus('all'); setSavedOnly(false) }}>Limpiar filtros</button>
          </div>
        )}
      </main>

      {selectedProduct && <ProductDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onContact={startContact} />}
      {authMode && <AuthDialog initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}

export default App