import { useCallback, useEffect, useState } from 'react'
import { Flag } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { MOTIVOS_REPORTE, socialService } from '../services/social.js'
import './pages.css'

const css = `
.rp-form{display:grid;gap:10px;padding:18px;border:1px solid #e5e5e5;border-radius:18px;margin-bottom:20px;background:#fff}
.rp-form h3{margin:0}
.rp-form input,.rp-form select,.rp-form textarea{padding:12px;border:1px solid #d5d5d5;border-radius:12px;font:inherit}
.rp-form button{justify-self:start;padding:12px 24px;border:0;border-radius:999px;background:var(--primary,#2f6f5e);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.rp-form button:disabled{opacity:.5;cursor:not-allowed}
.rp-msg{margin:0 0 12px}
.rp-msg.err{color:#b3261e}
.rp-resp{margin-top:6px;font-style:italic}
`

const ESTADOS = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
}

const CLASE = {
  pendiente: 'pendiente',
  en_revision: 'en-camino',
  resuelto: 'entregado',
  rechazado: 'pendiente',
}

const etiquetaMotivo = (id) => MOTIVOS_REPORTE.find((m) => m.id === id)?.label || id
const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MisReportes() {
  const { user } = useUser()
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [username, setUsername] = useState('')
  const [motivo, setMotivo] = useState(MOTIVOS_REPORTE[0].id)
  const [descripcion, setDescripcion] = useState('')

  const cargar = useCallback(async () => {
    try {
      setReportes(await socialService.misReportes())
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

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    setOk('')
    try {
      await socialService.reportar({
        username: username.trim().replace(/^@/, ''),
        motivo,
        descripcion,
      })
      setOk('Reporte enviado. Un administrador lo revisará.')
      setUsername('')
      setDescripcion('')
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!user) return <p className="page-count">Inicia sesión con el botón «Entrar» para ver tus reportes.</p>
  if (cargando) return <p className="page-count">Cargando…</p>

  return (
    <>
      <style>{css}</style>

      <form className="rp-form" onSubmit={enviar}>
        <h3>Reportar a un usuario</h3>
        <input
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          aria-label="Nombre de usuario"
        />
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} aria-label="Motivo">
          {MOTIVOS_REPORTE.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <textarea
          rows={3}
          maxLength={1000}
          placeholder="Describe lo que pasó (obligatorio si eliges «Otro»)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar reporte'}</button>
      </form>

      {ok && <p className="rp-msg">{ok}</p>}
      {error && <p className="rp-msg err" role="alert">{error}</p>}

      <section className="compras-list">
        {reportes.map((r) => (
          <article key={r.id} className="compra">
            <div className="compra__img"><Flag size={28} /></div>
            <div className="compra__info">
              <h3>{etiquetaMotivo(r.motivo)}{r.producto ? ` · ${r.producto}` : ''}</h3>
              <p>Reportado: {r.reportado} · {fecha(r.fecha_creacion)}</p>
              {r.descripcion && <p>{r.descripcion}</p>}
              {r.respuesta && <p className="rp-resp">Respuesta: {r.respuesta}</p>}
            </div>
            <span className={`estado estado--${CLASE[r.estado]}`}>{ESTADOS[r.estado]}</span>
          </article>
        ))}
        {reportes.length === 0 && <p className="page-count">Aún no has enviado reportes.</p>}
      </section>
    </>
  )
}