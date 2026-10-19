import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Package, Plus, Trash2 } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { socialService } from '../services/social.js'
import { imgUrl } from '../services/media.js'
import './pages.css'

const css = `
.cart-qty{display:flex;align-items:center;gap:8px}
.cart-qty button,.cart-del{display:grid;place-items:center;width:32px;height:32px;border:1px solid #d9d9d9;border-radius:8px;background:#fff;cursor:pointer}
.cart-qty button:disabled{opacity:.4;cursor:not-allowed}
.cart-total{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:16px 20px;border:1px solid #e5e5e5;border-radius:18px}
.cart-buy{padding:12px 24px;border:0;border-radius:999px;background:var(--primary,#a32638);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.cart-buy:disabled{opacity:.5;cursor:not-allowed}
.cart-msg{margin:12px 0}
.cart-msg.err{color:#b3261e}
`

const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export default function Carrito() {
  const { user } = useUser()
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setItems(await socialService.carrito())
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

  async function cambiar(item, cantidad) {
    if (cantidad < 1 || cantidad > item.stock) return
    setError('')
    try {
      await socialService.cantidadCarrito(item.id, cantidad)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  async function quitar(item) {
    setError('')
    try {
      await socialService.quitarCarrito(item.id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  async function comprar() {
    setEnviando(true)
    setError('')
    setOk('')
    try {
      const r = await socialService.comprarCarrito()
      setOk(`${r.mensaje}: ${r.compras} producto(s). Revisa «Mis compras».`)
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!user) return <p className="page-count">Inicia sesión para ver tu carrito.</p>
  if (cargando) return <p className="page-count">Cargando…</p>

  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)
  const noDisponibles = items.some((i) => i.estado !== 'disponible' || i.stock < i.cantidad)

  return (
    <>
      <style>{css}</style>
      {ok && <p className="cart-msg">{ok}</p>}
      {error && <p className="cart-msg err" role="alert">{error}</p>}

      {items.length === 0 ? (
        <div className="vacio">
          <h2>Tu carrito está vacío</h2>
          <Link to="/explorar">Explorar artículos</Link>
        </div>
      ) : (
        <>
          <section className="compras-list">
            {items.map((i) => (
              <article key={i.id} className="compra">
                <div className="compra__img">
                  {i.imagen ? <img src={imgUrl(i.imagen)} alt="" /> : <Package size={28} />}
                </div>
                <div className="compra__info">
                  <h3>{i.nombre}</h3>
                  <p>
                    Vendedor: {i.vendedor} · {dinero(i.precio)} c/u
                    {i.estado !== 'disponible' ? ' · No disponible' : ''}
                  </p>
                </div>
                <div className="cart-qty">
                  <button type="button" aria-label="Menos" disabled={i.cantidad <= 1} onClick={() => cambiar(i, i.cantidad - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{i.cantidad}</span>
                  <button type="button" aria-label="Más" disabled={i.cantidad >= i.stock} onClick={() => cambiar(i, i.cantidad + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <strong className="compra__precio">{dinero(i.precio * i.cantidad)}</strong>
                <button type="button" className="cart-del" aria-label="Quitar" onClick={() => quitar(i)}>
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </section>

          <div className="cart-total">
            <strong>Total: {dinero(total)}</strong>
            <button type="button" className="cart-buy" disabled={enviando || noDisponibles} onClick={comprar}>
              {enviando ? 'Procesando…' : 'Comprar todo'}
            </button>
          </div>
          {noDisponibles && <p className="cart-msg err">Hay productos sin existencias. Quítalos para continuar.</p>}
        </>
      )}
    </>
  )
}