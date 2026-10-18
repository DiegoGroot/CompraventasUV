const BASE = 'http://localhost:8081'
const API = `${BASE}/api/v1`
const FIELD = 'imagen' // ← debe coincidir con c.FormFile("...") del backend

const token = () => sessionStorage.getItem('compraventasuv:token')

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  if (token()) headers.Authorization = `Bearer ${token()}`
  if (body) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: form ?? (body ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Ocurrió un error.')
  return data
}

export const urlImagen = (url) =>
  !url ? '' : url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`

export const productService = {
  categorias: () => request('/categorias'),
  misProductos: () => request('/mis-productos'),
  crear: (datos) => request('/productos', { method: 'POST', body: datos }),
  editar: (id, datos) => request(`/productos/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
  cambiarEstado: (id, estado) =>
    request(`/productos/${id}/estado`, { method: 'PATCH', body: { estado } }),
  async subirImagen(file) {
    const form = new FormData()
    form.append(FIELD, file)
    const data = await request('/upload', { method: 'POST', form })
    return data.url ?? data.ruta ?? data.path
  },
}