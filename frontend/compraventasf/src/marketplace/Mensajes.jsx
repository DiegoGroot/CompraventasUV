import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { socialService } from '../services/social.js'

const css = `
.ms{display:grid;grid-template-columns:300px 1fr;gap:16px;height:calc(100vh - 190px);min-height:420px}
.ms-list,.ms-chat{background:var(--surface);border:1px solid var(--border);border-radius:18px;overflow:hidden;display:flex;flex-direction:column}
.ms-item{display:flex;gap:12px;align-items:center;padding:14px 16px;border:0;border-bottom:1px solid var(--border);background:transparent;text-align:left;cursor:pointer;font:inherit}
.ms-item:hover,.ms-item.on{background:var(--green-soft)}
.ms-item strong{display:block}
.ms-item small{color:var(--muted);display:block;max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ms-dot{margin-left:auto;min-width:20px;height:20px;border-radius:10px;background:var(--green);color:#fff;font-size:12px;display:grid;place-items:center}
.ms-head{padding:16px;border-bottom:1px solid var(--border);font-weight:600}
.ms-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
.ms-b{max-width:70%;padding:10px 14px;border-radius:16px;background:#f1f0ec;align-self:flex-start;word-break:break-word}
.ms-b.me{background:var(--green);color:#fff;align-self:flex-end}
.ms-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--border)}
.ms-form input{flex:1;padding:12px;border:1px solid var(--border);border-radius:12px;font:inherit}
.ms-form button{display:grid;place-items:center;width:46px;border:0;border-radius:12px;background:var(--green);color:#fff;cursor:pointer}
.ms-empty{margin:auto;color:var(--muted);text-align:center;padding:24px}
.ms-err{color:#b3261e;padding:0 16px}
@media(max-width:800px){.ms{grid-template-columns:1fr;height:auto}}
`

export default function Mensajes() {
  const { user } = useUser()
  const [params] = useSearchParams()
  const [convs, setConvs] = useState([])
  const [activo, setActivo] = useState(null) // { id, nombre }
  const [hilo, setHilo] = useState([])
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const fin = useRef(null)

  const cargarConvs = useCallback(async () => {
    try { setConvs(await socialService.conversaciones()) } catch (e) { setError(e.message) }
  }, [])

  const cargarHilo = useCallback(async (id) => {
    try { setHilo(await socialService.hilo(id)) } catch (e) { setError(e.message) }
  }, [])

  // Conversación abierta desde "Contactar vendedor"
  useEffect(() => {
    const con = params.get('con')
    if (con) setActivo({ id: con, nombre: params.get('nombre') || 'Vendedor' })
  }, [params])

  // Carga inicial + actualización cada 5 s
  useEffect(() => {
    if (!user) return undefined
    cargarConvs()
    if (activo) cargarHilo(activo.id)
    const t = setInterval(() => {
      cargarConvs()
      if (activo) cargarHilo(activo.id)
    }, 5000)
    return () => clearInterval(t)
  }, [user, activo, cargarConvs, cargarHilo])

  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }) }, [hilo])

  if (!user) return <p>Inicia sesión con el botón «Entrar» para ver tus mensajes.</p>

  async function enviar(e) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido || !activo) return
    setError('')
    try {
      await socialService.enviar(activo.id, contenido, params.get('producto'))
      setTexto('')
      await cargarHilo(activo.id)
      cargarConvs()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="ms">
        <div className="ms-list">
          {convs.length === 0 && !activo && <p className="ms-empty">Aún no tienes conversaciones.</p>}
          {convs.map((c) => (
            <button key={c.usuario_id} className={`ms-item ${activo?.id === c.usuario_id ? 'on' : ''}`}
              onClick={() => setActivo({ id: c.usuario_id, nombre: c.usuario })}>
              <div className="avatar">{c.usuario.slice(0, 2).toUpperCase()}</div>
              <div><strong>{c.usuario}</strong><small>{c.ultimo}</small></div>
              {c.no_leidos > 0 && <span className="ms-dot">{c.no_leidos}</span>}
            </button>
          ))}
        </div>

        <div className="ms-chat">
          {activo ? (
            <>
              <div className="ms-head">{activo.nombre}</div>
              <div className="ms-msgs">
                {hilo.length === 0 && <p className="ms-empty">Escribe el primer mensaje.</p>}
                {hilo.map((m) => (
                  <div key={m.id} className={`ms-b ${m.de_id === activo.id ? '' : 'me'}`}>{m.contenido}</div>
                ))}
                <div ref={fin} />
              </div>
              {error && <p className="ms-err" role="alert">{error}</p>}
              <form className="ms-form" onSubmit={enviar}>
                <input value={texto} onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe un mensaje…" maxLength={1000} aria-label="Mensaje" />
                <button type="submit" aria-label="Enviar"><Send size={20} /></button>
              </form>
            </>
          ) : (
            <p className="ms-empty">Selecciona una conversación.</p>
          )}
        </div>
      </div>
    </>
  )
}