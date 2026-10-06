export default function ProductCard({ product, isSaved, onOpen, onToggleSaved }) {
  return (
    <article className="product-card">
      <button className="product-open" type="button" onClick={onOpen} aria-label={`Ver ${product.title}`}>
        <span className="product-image-wrap"><img src={product.image} alt={product.title} loading="lazy" /><span className="condition-label">{product.condition}</span></span>
        <span className="product-info"><span className="product-title">{product.title}</span><span className="product-campus">{product.campus}</span><span className="product-price">{product.price} €</span></span>
      </button>
      <button className={isSaved ? 'save-button saved' : 'save-button'} type="button" aria-label={isSaved ? `Quitar ${product.title} de guardados` : `Guardar ${product.title}`} aria-pressed={isSaved} onClick={onToggleSaved}>{isSaved ? '♥' : '♡'}</button>
    </article>
  )
}