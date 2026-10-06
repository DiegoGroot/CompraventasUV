import { useEffect } from 'react'

export default function ProductDialog({ product, onClose, onContact }) {
  useEffect(() => {
    function handleKeyDown(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <img className="detail-image" src={product.image} alt={product.title} />
        <div className="detail-content"><p className="detail-campus">{product.campus} · {product.condition}</p><h2 id="product-dialog-title">{product.title}</h2><p className="detail-price">{product.price} €</p><p className="detail-description">{product.description}</p><p className="seller-line">Publicado por <strong>{product.seller}</strong> · {product.postedAt}</p><button className="publish-button contact-button" type="button" onClick={onContact}>Contactar vendedor</button></div>
      </section>
    </div>
  )
}