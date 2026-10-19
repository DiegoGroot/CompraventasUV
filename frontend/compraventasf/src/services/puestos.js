import { request } from './products.js'

export const puestosService = {
  listar: () => request('/puestos'),
  misTiendas: () => request('/mis-tiendas'),
  crear: (datos) => request('/tiendas', { method: 'POST', body: datos }),
  eliminar: (id) => request(`/tiendas/${id}`, { method: 'DELETE' }),
  asignarProducto: (productoId, tiendaId) =>
    request(`/productos/${productoId}/tienda`, {
      method: 'PATCH',
      body: { tienda_id: tiendaId || null },
    }),
}