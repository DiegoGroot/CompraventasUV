// Ruta base de la API backend de Go
const API_URL = "http://localhost:8080/api/auth";

// Petición para validar credenciales y solicitar el envío de correo
export async function enviarCodigoCorreo(email, password) {
  try {
    const response = await fetch(`${API_URL}/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return { ok: response.ok, message: data.message };
  } catch {
    // Si aún no está corriendo el backend, simulamos una respuesta exitosa para probar
    return { ok: true, message: "Código enviado" };
  }
}

// Petición para verificar el código de 6 dígitos ingresado por el usuario
export async function verificarCodigo(email, code) {
  try {
    const response = await fetch(`${API_URL}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    return { ok: response.ok, token: data.token, message: data.message };
  } catch {
    // Si aún no está corriendo el backend, validamos el código de prueba '123456'
    if (code === "123456") {
      return { ok: true, message: "Acceso correcto" };
    }
    return { ok: false, message: "Código incorrecto. Usa 123456" };
  }
}