import { imgUrl } from '../../services/media.js'
import { dinero } from '../../services/vistaProducto.js'

const SIN_IMAGEN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#ecefe9"/></svg>',
  )

export default function PuestoCard({ puesto }) {
  const portada = imgUrl(puesto.imagen)
  const iniciales = (puesto.vendedor || '?').slice(0, 2).toUpperCase()
  const total = puesto.total_productos

  return (
    <article className="puesto-card">
      <div className="puesto-card__cover">
        {portada && <img src={portada} alt={puesto.nombre} loading="lazy" />}
        {puesto.categoria && <span className="puesto-card__tag">{puesto.categoria}</span>}
      </div>

      <div className="puesto-card__body">
        <div className="puesto-card__owner">
          <div
            className="puesto-card__avatar"
            style={{ display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--green)' }}
            aria-hidden="true"
          >
            {iniciales}
          </div>
          <div>
            <h3>{puesto.nombre}</h3>
            <p>{puesto.vendedor}{puesto.campus ? ` · ${puesto.campus}` : ''}</p>
          </div>
        </div>

        {puesto.descripcion && (
          <p style={{ margin: '14px 0 0', color: 'var(--muted)' }}>{puesto.descripcion}</p>
        )}

        <div className="puesto-card__meta">
          <span>{total} {total === 1 ? 'producto' : 'productos'}</span>
        </div>

        <div className="puesto-card__thumbs">
          {puesto.productos.map((p) => (
            <img
              key={p.id}
              src={imgUrl(p.imagen) || SIN_IMAGEN}
              alt={p.nombre}
              title={`${p.nombre} · ${dinero(p.precio)}`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </article>
  )
}