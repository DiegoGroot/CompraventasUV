import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { productService, urlImagen } from '../services/products.js'

const ESTADOS = ['disponible', 'reservado', 'vendido', 'oculto']

const css = `
.me-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap}
.me-head h2{margin:0;font-family:var(--font-title)}
.me-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border:0;border-radius:12px;background:var(--green);color:#fff;font:600 16px var(--font-body);cursor:pointer}
.me-btn.sec{background:transparent;color:var(--green);border:1px solid var(--green)}
.me-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.me-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;overflow:hidden}
.me-card img,.me-noimg{width:100%;height:170px;object-fit:cover;background:#eee;display:block}
.me-body{padding:14px}
.me-body h3{margin:0 0 4px;font-size:17px}
.me-price{font-weight:700;color:var(--green);margin-bottom:10px}
.me-row{display:flex;gap:8px;align-items:center}
.me-row select{flex:1;padding:8px;border:1px solid var(--border);border-radius:10px;font:inherit}
.me-icon{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--border);border-radius:10px;background:var(--surface);cursor:pointer;color:var(--muted)}
.me-icon:hover{color:var(--green)}
.me-empty{text-align:center;color:var(--muted);padding:48px 0}
.me-form{max-width:640px;display:flex;flex-direction:column;gap:6px}
.me-form label{font-weight:600;margin-top:12px}
.me-form input,.me-form textarea,.me-form select{padding:12px;border:1px solid var(--border);border-radius:12px;font:inherit}
.me-form textarea{min-height:100px}
.me-dual{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.me-previews{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.me-previews img{width:90px;height:90px;object-fit:cover;border-radius:10px}
.me-err{color:#b3261e;margin-top:8px}
`

function Formulario({ inicial, categorias, user, onCancel, onSaved }) {
  const editando = Boolean(inicial)
  const [nombre, setNombre] = useState(inicial?.Nombre ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.Descripcion ?? '')
  const [precio, setPrecio] = useState(inicial?.Precio ?? '')
  const [stock, setStock] = useState(inicial?.Stock ?? 1)
  const [categoriaId, setCategoriaId] = useState(inicial?.CategoriaID ?? '')
  const [archivos, setArchivos] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const previews = archivos.map((f) => URL.createObjectURL(f))

  async function enviar(e) {
    e.preventDefault()
    setError('')
    if (!categoriaId) return setError('Elige una categoría.')
    if (!editando && archivos.length === 0) return setError('Agrega al menos una foto.')
    if (!editando && (!user.regionId || !user.facultadId))
      return setError('Cierra sesión y vuelve a entrar para completar tu perfil.')

    setGuardando(true)
    try {
      const imagenes = archivos.length
        ? await Promise.all(archivos.map((f) => productService.subirImagen(f)))
        : inicial.Imagenes.map((i) => i.UrlImagen)

      const datos = {
        categoria_id: Number(categoriaId),
        region_id: editando ? inicial.RegionID : user.regionId,
        facultad_id: editando ? inicial.FacultadID : user.facultadId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: Number(precio),
        stock: Number(stock) || 1,
        imagenes,
      }
      if (editando) await productService.editar(inicial.ID, datos)
      else await productService.crear(datos)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="me-form" onSubmit={enviar}>
      <button type="button" className="me-btn sec" style={{ alignSelf: 'flex-start' }} onClick={onCancel}>
        <ArrowLeft size={18} /> Volver
      </button>
      <h2 style={{ fontFamily: 'var(--font-title)' }}>{editando ? 'Editar publicación' : 'Nueva publicación'}</h2>

      <label htmlFor="me-fotos">Fotos {editando && '(opcional: reemplazan las actuales)'}</label>
      <input id="me-fotos" type="file" accept="image/*" multiple
        onChange={(e) => setArchivos(Array.from(e.target.files).slice(0, 5))} />
      <div className="me-previews">
        {previews.length
          ? previews.map((p) => <img key={p} src={p} alt="" />)
          : editando && inicial.Imagenes.map((i) => <img key={i.ID} src={urlImagen(i.UrlImagen)} alt="" />)}
      </div>

      <label htmlFor="me-nombre">Nombre *</label>
      <input id="me-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

      <label htmlFor="me-desc">Descripción</label>
      <textarea id="me-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

      <div className="me-dual">
        <div>
          <label htmlFor="me-precio">Precio (MXN) *</label>
          <input id="me-precio" type="number" min="0.01" step="0.01" value={precio}
            onChange={(e) => setPrecio(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div>
          <label htmlFor="me-stock">Existencias</label>
          <input id="me-stock" type="number" min="1" value={stock}
            onChange={(e) => setStock(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <label htmlFor="me-cat">Categoría *</label>
      <select id="me-cat" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
        <option value="">Selecciona</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>

      {error && <p className="me-err" role="alert">{error}</p>}
      <button className="me-btn" type="submit" disabled={guardando} style={{ marginTop: 16 }}>
        {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Publicar'}
      </button>
    </form>
  )
}

export default function MiEspacio() {
  const { user } = useUser()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('lista') // 'lista' | 'form'
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')

  async function cargar() {
    setCargando(true)
    try {
      setProductos(await productService.misProductos())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!user) return
    cargar()
    productService.categorias().then(setCategorias).catch(() => {})
  }, [user])

  if (!user) return <p>Inicia sesión con el botón «Entrar» para ver tu espacio.</p>

  async function cambiarEstado(id, estado) {
    try {
      await productService.cambiarEstado(id, estado)
      setProductos((ps) => ps.map((p) => (p.ID === id ? { ...p, Estado: estado } : p)))
    } catch (e) {
      setError(e.message)
    }
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar «${p.Nombre}»? Esta acción no se puede deshacer.`)) return
    try {
      await productService.eliminar(p.ID)
      setProductos((ps) => ps.filter((x) => x.ID !== p.ID))
    } catch (e) {
      setError(e.message)
    }
  }

  if (vista === 'form') {
    return (
      <>
        <style>{css}</style>
        <Formulario
          inicial={editando}
          categorias={categorias}
          user={user}
          onCancel={() => { setVista('lista'); setEditando(null) }}
          onSaved={() => { setVista('lista'); setEditando(null); cargar() }}
        />
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="me-head">
        <h2>Mis publicaciones</h2>
        <button className="me-btn" onClick={() => { setEditando(null); setVista('form') }}>
          <Plus size={20} /> Nueva publicación
        </button>
      </div>

      {error && <p className="me-err" role="alert">{error}</p>}

      {cargando ? (
        <p className="me-empty">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="me-empty">Aún no has publicado nada.</p>
      ) : (
        <div className="me-grid">
          {productos.map((p) => {
            const img = (p.Imagenes || []).find((i) => i.EsPrincipal) || (p.Imagenes || [])[0]
            return (
              <article className="me-card" key={p.ID}>
                {img ? <img src={urlImagen(img.UrlImagen)} alt={p.Nombre} /> : <div className="me-noimg" />}
                <div className="me-body">
                  <h3>{p.Nombre}</h3>
                  <div className="me-price">${Number(p.Precio).toFixed(2)} MXN · {p.Stock} disp.</div>
                  <div className="me-row">
                    <select value={p.Estado} onChange={(e) => cambiarEstado(p.ID, e.target.value)}
                      aria-label="Estado de la publicación">
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="me-icon" title="Editar" onClick={() => { setEditando(p); setVista('form') }}>
                      <Pencil size={18} />
                    </button>
                    <button className="me-icon" title="Eliminar" onClick={() => eliminar(p)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}