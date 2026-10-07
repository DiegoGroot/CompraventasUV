import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import Explorar from './Explorar.jsx'

const Pendiente = ({ nombre }) => <p>Página «{nombre}» en construcción</p>

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Pendiente nombre="Inicio" />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/puestos" element={<Pendiente nombre="Puestos" />} />
        <Route path="/favoritos" element={<Pendiente nombre="Favoritos" />} />
        <Route path="/carrito" element={<Pendiente nombre="Carrito" />} />
        <Route path="/mis-compras" element={<Pendiente nombre="Mis compras" />} />
        <Route path="/mensajes" element={<Pendiente nombre="Mensajes" />} />
        <Route path="/mi-espacio" element={<Pendiente nombre="Mi espacio" />} />
        <Route path="/perfil" element={<Pendiente nombre="Perfil" />} />
      </Route>
    </Routes>
  )
}