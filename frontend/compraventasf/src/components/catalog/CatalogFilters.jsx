export default function CatalogFilters({ categories, selectedCategory, onCategoryChange, campuses, selectedCampus, onCampusChange, sortOrder, onSortChange, savedCount, savedOnly, onSavedOnlyChange }) {
  return (
    <section className="catalog-controls" aria-label="Filtros del catálogo">
      <div className="category-list" role="group" aria-label="Filtrar por categoría">
        {categories.map((category) => (
          <button key={category.id} type="button" className={selectedCategory === category.id ? 'category-chip selected' : 'category-chip'} aria-pressed={selectedCategory === category.id} onClick={() => onCategoryChange(category.id)}>{category.label}</button>
        ))}
      </div>
      <div className="refine-controls">
        <label><span className="visually-hidden">Campus</span><select value={selectedCampus} onChange={(event) => onCampusChange(event.target.value)}><option value="all">Todos los campus</option>{campuses.map((campus) => <option key={campus} value={campus}>{campus}</option>)}</select></label>
        <label><span className="visually-hidden">Ordenar artículos</span><select value={sortOrder} onChange={(event) => onSortChange(event.target.value)}><option value="recent">Más recientes</option><option value="price-low">Precio: menor a mayor</option><option value="price-high">Precio: mayor a menor</option></select></label>
        <button className={savedOnly ? 'saved-filter active' : 'saved-filter'} type="button" aria-pressed={savedOnly} onClick={onSavedOnlyChange}>Guardados <span>{savedCount}</span></button>
      </div>
    </section>
  )
}