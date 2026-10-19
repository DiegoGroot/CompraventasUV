import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext.jsx'
import { MOTIVOS_REPORTE, socialService } from '../../services/social.js'
import { dinero } from '../../services/vistaProducto.js'

const css = `
.dlg-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.dlg-actions button{padding:10px 16px;border-radius:999px;font:inherit;font-weight:600;cursor:pointer}
.dlg-sec{border:1px solid #cfcfcf;background:#fff;color:inherit}
.dlg-sec:disabled,.dlg-actions .publish-button:disabled{opacity:.5;cursor:not-allowed}
.dlg-link{margin-top:12px;border:0;background:none;color:#b3261e;font:inherit;text-decoration:underline;cursor:pointer;padding:0}
.dlg-report{display:grid;gap:8px;margin-top:12px}
.dlg-report select,.dlg-report textarea{padding:10px;border:1px solid #cfcfcf;border-radius:10px;font:inherit}
.dlg-msg{margin-top:12px}
.dlg-msg.err{color:#b3261e}
`

export default function ProductDialog({ product, onClose, onChanged }) {
  const { user } = useUser()
  const navigate = useNavigate()
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [reportando, setReportando] = useState(false)
  const [motivo, setMotivo] = useState(MOTIVOS_REPORTE[0].id)
  const [detalle, setDetalle] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function ejecutar(accion, exito) {
    if (!user) {
      setError('Inicia sesión con el botón «Entrar» para continuar.')
      return
    }
    setOcupado(true)
    setError('')
    setMsg('')
    try {
      await accion()
      setMsg(exito)
      onChanged?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const agregar = () =>
    ejecutar(() => socialService.agregarCarrito(product.id, 1), 'Agregado al carrito.')

  const comprar = () =>
    ejecutar(() => socialService.comprar(product.id, 1), 'Compra registrada. Revisa «Mis compras».')

  function contactar() {
    if (!user) {
      setError('Inicia sesión con el botón «Entrar» para contactar al vendedor.')
      return
    }
    onClose()
    navigate(
      `/mensajes?con=${product.sellerId}&nombre=${encodeURIComponent(product.seller)}&producto=${product.id}`,
    )
  }

  function enviarReporte(e) {
    e.preventDefault()
    ejecutar(async () => {
      await socialService.reportar({ producto_id: product.id, motivo, descripcion: detalle })
      setReportando(false)
      setDetalle('')
    }, 'Reporte enviado. Lo verás en «Mis reportes».')
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <style>{css}</style>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <img className="detail-image" src={product.image} alt={product.title} />
        <div className="detail-content">
          <p className="detail-campus">{product.campus} · {product.condition}</p>
          <h2 id="product-dialog-title">{product.title}</h2>
          <p className="detail-price">{dinero(product.price)}</p>
          <p className="detail-description">{product.description}</p>
          <p className="seller-line">Publicado por <strong>{product.seller}</strong> · {product.postedAt}</p>

          <div className="dlg-actions">
            <button className="publish-button" type="button" disabled={ocupado || !product.available} onClick={comprar}>
              Comprar
            </button>
            <button className="dlg-sec" type="button" disabled={ocupado || !product.available} onClick={agregar}>
              Agregar al carrito
            </button>
            <button className="dlg-sec" type="button" onClick={contactar}>
              Contactar vendedor
            </button>
          </div>

          {msg && <p className="dlg-msg">{msg}</p>}
          {error && <p className="dlg-msg err" role="alert">{error}</p>}

          {!reportando ? (
            <button className="dlg-link" type="button" onClick={() => setReportando(true)}>
              Reportar esta publicación
            </button>
          ) : (
            <form className="dlg-report" onSubmit={enviarReporte}>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} aria-label="Motivo">
                {MOTIVOS_REPORTE.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Cuéntanos qué pasó (obligatorio si eliges «Otro»)"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
              <div className="dlg-actions">
                <button className="publish-button" type="submit" disabled={ocupado}>Enviar reporte</button>
                <button className="dlg-sec" type="button" onClick={() => setReportando(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}