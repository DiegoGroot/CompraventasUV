import { createContext, useContext, useState } from 'react'

const USER_KEY = 'compraventasuv:user'
const TOKEN_KEY = 'compraventasuv:token'

const UserContext = createContext(null)

// Convierte la respuesta del backend al formato que usan Sidebar, Perfil y Mi espacio
function mapUsuario(u) {
  return {
    nombre: u.username,
    email: u.correo,
    matricula: (u.correo || '').split('@')[0].toUpperCase(),
    facultad: u.facultad || '—',
    campus: u.region || '—',
    regionId: u.region_id,
    facultadId: u.facultad_id,
    telefono: '—',
    rating: 0,
    resenas: 0,
    publicados: 0,
  }
}

function readUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw && sessionStorage.getItem(TOKEN_KEY) ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(readUser)

  function login(usuarioBackend) {
    const mapped = mapUsuario(usuarioBackend)
    sessionStorage.setItem(USER_KEY, JSON.stringify(mapped))
    setUser(mapped)
  }

  function logout() {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  function updateUser(changes) {
    setUser((current) => {
      const next = { ...current, ...changes }
      sessionStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }

  const initials = user
    ? user.nombre.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 2).toUpperCase()
    : ''

  return (
    <UserContext.Provider value={{ user, initials, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)