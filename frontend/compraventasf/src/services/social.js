import { request } from './products.js'

export const MOTIVOS_REPORTE = [
  { id: 'imagen_inapropiada', label: 'Imagen inapropiada' },
  { id: 'producto_prohibido', label: 'Producto prohibido' },
  { id: 'informacion_falsa', label: 'Información falsa' },
  { id: 'posible_fraude', label: 'Posible fraude' },
  { id: 'publicacion_enganosa', label: 'Publicación engañosa' },
  { id: 'producto_defectuoso', label: 'Producto defectuoso' },
  { id: 'conducta_inapropiada', label: 'Conducta inapropiada' },
  { id: 'otro', label: 'Otro' },
]

export const socialService = {
  comprar: (productoId, cantidad = 1) =>
    request('/compras', { method: 'POST', body: { producto_id: productoId, cantidad } }),
  misCompras: () => request('/mis-compras'),
  misVentas: () => request('/mis-ventas'),
  estadoCompra: (id, estado) =>
    request(`/compras/${id}/estado`, { method: 'PATCH', body: { estado } }),

  conversaciones: () => request('/conversaciones'),
  hilo: (usuarioId) => request(`/mensajes/${usuarioId}`),
  enviar: (paraId, contenido, productoId) =>
    request('/mensajes', {
      method: 'POST',
      body: { para_id: paraId, contenido, producto_id: productoId || null },
    }),

  carrito: () => request('/carrito'),
  agregarCarrito: (productoId, cantidad = 1) =>
    request('/carrito', { method: 'POST', body: { producto_id: productoId, cantidad } }),
  cantidadCarrito: (productoId, cantidad) =>
    request(`/carrito/${productoId}`, { method: 'PATCH', body: { cantidad } }),
  quitarCarrito: (productoId) => request(`/carrito/${productoId}`, { method: 'DELETE' }),
  comprarCarrito: () => request('/carrito/comprar', { method: 'POST' }),

  favoritos: () => request('/favoritos'),
  alternarFavorito: (productoId) => request(`/favoritos/${productoId}`, { method: 'POST' }),

  catalogo: (soloFavoritos = false) =>
    request(soloFavoritos ? '/catalogo?favoritos=1' : '/catalogo'),

  reportar: (datos) => request('/reportes', { method: 'POST', body: datos }),
  misReportes: () => request('/mis-reportes'),
}