import { useState } from "react";

const css = `
.rg{--bg:#eef2f1;--card:#fff;--ink:#16302b;--muted:#5d716c;--line:#c9d6d3;--accent:#0f6b5c;--accent-ink:#fff;--err:#b3261e;
  min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);
  font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;box-sizing:border-box}
@media (prefers-color-scheme:dark){.rg{--bg:#0e1917;--card:#15241f;--ink:#e6f0ed;--muted:#92a8a2;--line:#2a3f39;--accent:#3cb89f;--accent-ink:#06201a;--err:#ff8a80}}
.rg *{box-sizing:border-box}
.rg-card{width:100%;max-width:420px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:32px 28px}
.rg h1{font-size:1.6rem;margin:0 0 6px}
.rg .sub{margin:0 0 20px;color:var(--muted);font-size:.9rem}
.rg label{display:block;font-weight:600;font-size:.88rem;margin:14px 0 4px}
.rg input{width:100%;font:inherit;color:inherit;background:transparent;border:1px solid var(--line);border-radius:8px;padding:10px 12px}
.rg input:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.rg input[aria-invalid="true"]{border-color:var(--err)}
.rg .err{color:var(--err);font-size:.8rem;min-height:1.2em;margin:4px 0 0}
.rg .submit{width:100%;margin-top:20px;padding:12px;font:inherit;font-weight:600;background:var(--accent);color:var(--accent-ink);border:0;border-radius:8px;cursor:pointer}
.rg .submit:disabled{opacity:.6;cursor:default}
.rg .switch-btn{background:none;border:none;color:var(--muted);font:inherit;font-size:.85rem;cursor:pointer;margin-top:16px;text-decoration:underline;width:100%;text-align:center}
`;

export default function Register({ onRegister, onGoToLogin }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = onRegister || (async () => {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};

    if (!nombre.trim()) errs.nombre = "Ingresa tu nombre completo.";
    
    // Validación de correo UV
    const correoLimpio = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+\$/.test(correoLimpio)) {
      errs.email = "Escribe un correo válido.";
    } else if (!correoLimpio.endsWith("@uv.mx") && !correoLimpio.endsWith("@estudiantes.uv.mx")) {
      errs.email = "Debes usar tu correo institucional (@uv.mx o @estudiantes.uv.mx).";
    }

    if (password.length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const resp = await handleRegister({ nombre: nombre.trim(), email: correoLimpio, password });
      if (resp.ok) {
        setSuccess(true);
      } else {
        setErrors({ email: resp.message || "Error al registrar la cuenta." });
      }
    } catch {
      setErrors({ general: "Error de conexión con el servidor." });
    }
    setLoading(false);
  }

  return (
    <div className="rg">
      <style>{css}</style>
      <main className="rg-card">
        {success ? (
          <section style={{ textAlign: "center" }}>
            <h1>¡Cuenta creada!</h1>
            <p className="sub">Tu registro en Compraventas UV fue exitoso.</p>
            <button className="submit" type="button" onClick={onGoToLogin}>
              Ir a iniciar sesión
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1>Crear cuenta</h1>
            <p className="sub">Únete a la comunidad de Compraventas UV</p>

            {errors.general && <p className="err" style={{ marginBottom: 12 }}>{errors.general}</p>}

            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Jessica Vázquez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={!!errors.nombre}
            />
            <p className="err">{errors.nombre}</p>

            <label htmlFor="email">Correo institucional</label>
            <input
              id="email"
              type="email"
              placeholder="usuario@estudiantes.uv.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            <p className="err">{errors.email}</p>

            <label htmlFor="pass">Contraseña</label>
            <input
              id="pass"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <p className="err">{errors.password}</p>

            <label htmlFor="confirmPass">Confirmar contraseña</label>
            <input
              id="confirmPass"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
            />
            <p className="err">{errors.confirmPassword}</p>

            <button className="submit" type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </button>

            <button type="button" className="switch-btn" onClick={onGoToLogin}>
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </form>
        )}
      </main>
    </div>
  );
}