import { postJson } from './apiClient.js'

export const authService = {
  register({ username, email, password, regionId, facultyId }) {
    return postJson('/registro', {
      username: username.trim(),
      correo: email,
      password,
      region_id: Number(regionId),
      facultad_id: Number(facultyId),
    })
  },
  async login({ identifier, password }) {
    const result = await postJson('/login', { identificador: identifier.trim(), password })
    if (result.token) sessionStorage.setItem('compraventasuv:token', result.token)
    return result
  },
}