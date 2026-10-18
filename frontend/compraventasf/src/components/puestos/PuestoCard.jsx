import { Star } from 'lucide-react'

export default function PuestoCard({ puesto }) {
  return (
    <article className="puesto-card">
      <div className="puesto-card__cover">
        <img src={puesto.portada} alt="" />
        <span className="puesto-card__tag">Puesto UV</span>
      </div>

      <div className="puesto-card__body">
        <div className="puesto-card__owner">
          <img className="puesto-card__avatar" src={puesto.avatar} alt="" />
          <div>
            <h3>{puesto.nombre}</h3>
            <p>{puesto.vendedor}</p>
          </div>
        </div>

        <div className="puesto-card__meta">
          <span className="puesto-card__rating">
            {Array.from({ length: puesto.rating }, (_, i) => (
              <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
            ))}
            <span>({puesto.resenas})</span>
          </span>
          <span>{puesto.productos.length} productos</span>
        </div>

        <div className="puesto-card__thumbs">
          {puesto.productos.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      </div>
    </article>
  )
}