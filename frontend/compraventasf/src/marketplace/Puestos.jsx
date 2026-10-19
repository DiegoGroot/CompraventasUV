import { useEffect, useState } from 'react'
import PuestoCard from '../components/puestos/PuestoCard.jsx'
import { useUser } from '../context/UserContext.jsx'
import { puestosService } from '../services/puestos.js'
import './puestos.css'

export default function Puestos() {
  const { user } = useUser()
  const [puestos, setPuestos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setCargando(false)
      return
    }
    puestosService
      .listar()
      .then((lista) => setPuestos(lista || []))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [user])

  return (
    <>
      <section className="puestos-banner">
        <h2>Puestos UV</h2>
        <p>
          Vendedores frecuentes que agrupan sus productos en un solo lugar.
          Explora catálogos completos de la comunidad.
        </p>
      </section>

      {!user && <p>Inicia sesión con el botón «Entrar» para ver los puestos.</p>}
      {user && cargando && <p>Cargando…</p>}
      {user && error && <p role="alert" style={{ color: '#b3261e' }}>{error}</p>}
      {user && !cargando && !error && puestos.length === 0 && (
        <p>Aún no hay puestos. Crea el primero desde «Mi espacio».</p>
      )}

      <section className="puestos-grid">
        {puestos.map((puesto) => (
          <PuestoCard key={puesto.id} puesto={puesto} />
        ))}
      </section>
    </>
  )
}