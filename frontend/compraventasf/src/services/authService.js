const API_URL = "http://localhost:8081/api/v1";

async function peticion(ruta, opciones = {}) {
  try {
    const res = await fetch(`${API_URL}${ruta}`, opciones);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, message: data.error || data.mensaje };
  } catch {
    return { ok: false, data: {}, message: "No se pudo conectar con el servidor" };
  }
}

const json = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const login = (identificador, password) =>
  peticion("/login", json({ identificador, password }));

export const registrar = (datos) => peticion("/registro", json(datos));

export const obtenerRegiones = () => peticion("/regiones");

export const obtenerFacultades = (regionId) =>
  peticion(`/regiones/${regionId}/facultades`);