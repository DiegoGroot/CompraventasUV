import { imgUrl } from './media.js'

const SIN_IMAGEN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="760" height="570"><rect width="100%" height="100%" fill="#ecefe9"/><text x="50%" y="50%" text-anchor="middle" fill="#8a8f87" font-family="sans-serif" font-size="28">Sin imagen</text></svg>',
  )

export const dinero = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export function aVistaProducto(p) {
  const disponible = p.estado === 'disponible' && p.stock > 0
  let condition = 'No disponible'
  if (disponible) condition = p.stock > 1 ? `${p.stock} disponibles` : 'Última pieza'

  return {
    id: p.id,
    title: p.nombre,
    category: p.categoria,
    price: p.precio,
    stock: p.stock,
    available: disponible,
    condition,
    seller: p.vendedor,
    sellerId: p.vendedor_id,
    campus: p.campus,
    postedAt: p.fecha_publicacion
      ? new Date(p.fecha_publicacion).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '',
    image: imgUrl(p.imagen) || SIN_IMAGEN,
    description: p.descripcion || 'Sin descripción.',
    saved: !!p.favorito,
  }
}