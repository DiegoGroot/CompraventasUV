import PuestoCard from '../components/puestos/PuestoCard.jsx'
import { puestos } from '../data/puestos.js'
import './puestos.css'

export default function Puestos() {
  return (
    <>
      <section className="puestos-banner">
        <h2>Puestos UV</h2>
        <p>
          Vendedores frecuentes que agrupan sus productos en un solo lugar.
          Explora catálogos completos de la comunidad.
        </p>
      </section>

      <section className="puestos-grid">
        {puestos.map((puesto) => (
          <PuestoCard key={puesto.id} puesto={puesto} />
        ))}
      </section>
    </>
  )
}