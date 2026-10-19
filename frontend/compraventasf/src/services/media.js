const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:8081'

export function imgUrl(ruta) {
  if (!ruta) return null
  if (/^https?:\/\//.test(ruta)) return ruta
  return API_HOST + ruta
}