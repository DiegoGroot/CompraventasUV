import { createContext, useContext, useState } from 'react'

const USUARIO_DEMO = {
  nombre: 'María Ramírez Olvera',
  matricula: 'S21014587',
  email: 's21014587@estudiantes.uv.mx',
  facultad: 'Medicina',
  campus: 'Xalapa',
  telefono: '+52 228 123 4567',
  rating: 5,
  resenas: 7,
  publicados: 5,
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  // TODO: reemplazar por la sesión real (useEffect + services/auth.js)
  const [user, setUser] = useState(USUARIO_DEMO)

  function updateUser(changes) {
    // TODO: enviar `changes` al backend y luego actualizar el estado
    setUser((current) => ({ ...current, ...changes }))
  }

  const initials = user
    ? user.nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : ''

  return (
    <UserContext.Provider value={{ user, initials, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)