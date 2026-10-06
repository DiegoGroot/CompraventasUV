const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servicio. Comprueba que la API esté disponible.')
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('El servicio respondió con un formato inesperado.')
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || 'No se pudo completar la solicitud.')
  }

  return result
}

export function postJson(path, payload) {
  return apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}