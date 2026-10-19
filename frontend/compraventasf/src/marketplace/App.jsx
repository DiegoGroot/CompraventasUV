import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import Explorar from './Explorar.jsx'
import Inicio from './Inicio.jsx'
import Puestos from './Puestos.jsx'
import Favoritos from './Favoritos.jsx'
import MisCompras from './MisCompras.jsx'
import MiEspacio from './MiEspacio.jsx'
import Perfil from './Perfil.jsx'
import Mensajes from './Mensajes.jsx'
import Carrito from './Carrito.jsx'
import MisReportes from './MisReportes.jsx'


const Pendiente = ({ nombre }) => <p>Página «{nombre}» en construcción</p>

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/puestos" element={<Puestos />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mis-compras" element={<MisCompras />} />
        <Route path="/mensajes" element={<Mensajes />} />
        <Route path="/mi-espacio" element={<MiEspacio />} />
         <Route path="/reportes" element={<MisReportes />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
    </Routes>
  )
}