import { apiRequest } from './apiClient.js'

async function getOptions(path, options) {
  const items = await apiRequest(path, options)
  if (!Array.isArray(items)) throw new Error('El catálogo recibido no tiene un formato válido.')
  return items
}

export const catalogService = {
  getRegions(options) {
    return getOptions('/regiones', options)
  },
  getFaculties(regionId, options) {
    return getOptions(`/regiones/${encodeURIComponent(regionId)}/facultades`, options)
  },
}