import { createContext, useContext, useEffect, useState } from 'react'

export const ACCENTS = [
  { id: 'verde', label: 'Verde', main: '#1b5e40', soft: '#eaf2ee' },
  { id: 'azul', label: 'Azul', main: '#1f5fa8', soft: '#e8f0fa' },
  { id: 'morado', label: 'Morado', main: '#6b3fa0', soft: '#f0eaf7' },
  { id: 'naranja', label: 'Naranja', main: '#c2571a', soft: '#fbeee5' },
  { id: 'rojo', label: 'Rojo', main: '#a82a3a', soft: '#fae9eb' },
]

const PreferencesContext = createContext(null)

function read(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function PreferencesProvider({ children }) {
  const [accentId, setAccentId] = useState(() => read('accent', 'verde'))
  const [collapsed, setCollapsed] = useState(() => read('sidebarCollapsed', 'false') === 'true')

  useEffect(() => {
    const accent = ACCENTS.find((a) => a.id === accentId) ?? ACCENTS[0]
    const root = document.documentElement
    root.style.setProperty('--green', accent.main)
    root.style.setProperty('--green-soft', accent.soft)
    write('accent', accentId)
  }, [accentId])

  useEffect(() => {
    write('sidebarCollapsed', String(collapsed))
  }, [collapsed])

  const value = {
    accentId,
    setAccentId,
    collapsed,
    toggleCollapsed: () => setCollapsed((c) => !c),
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => useContext(PreferencesContext)