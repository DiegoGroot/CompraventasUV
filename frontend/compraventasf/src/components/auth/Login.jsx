import { useState } from "react";
import { enviarCodigoCorreo, verificarCodigo } from "../../services/authService";

const css = `
.lg{--bg:#eef2f1;--card:#fff;--ink:#16302b;--muted:#5d716c;--line:#c9d6d3;--accent:#0f6b5c;--accent-ink:#fff;--err:#b3261e;
  min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);
  font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;box-sizing:border-box}
@media (prefers-color-scheme:dark){.lg{--bg:#0e1917;--card:#15241f;--ink:#e6f0ed;--muted:#92a8a2;--line:#2a3f39;--accent:#3cb89f;--accent-ink:#06201a;--err:#ff8a80}}
.lg *{box-sizing:border-box}
.lg-card{width:100%;max-width:400px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:32px 28px}
.lg h1{font-size:1.6rem;margin:0 0 6px}
.lg .sub{margin:0 0 20px;color:var(--muted);font-size:.9rem;line-height:1.4}
.lg label{display:block;font-weight:600;font-size:.9rem;margin:16px 0 6px}
.lg input{width:100%;font:inherit;color:inherit;background:transparent;border:1px solid var(--line);border-radius:8px;padding:11px 12px}
.lg input:focus-visible,.lg button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.lg input[aria-invalid="true"]{border-color:var(--err)}
.lg .pw{position:relative}
.lg .pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--muted);font:inherit;font-size:.85rem;cursor:pointer;padding:6px 8px}
.lg .err{color:var(--err);font-size:.85rem;min-height:1.2em;margin:6px 0 0}
.lg .submit{width:100%;margin-top:20px;padding:12px;font:inherit;font-weight:600;background:var(--accent);color:var(--accent-ink);border:0;border-radius:8px;cursor:pointer}
.lg .submit:disabled{opacity:.6;cursor:default}
.lg .ok{text-align:center}
.lg .ok button{margin-top:16px;background:none;border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:10px 16px;font:inherit;cursor:pointer}
.lg .code-input{letter-spacing:8px;font-size:1.3rem;text-align:center;font-weight:bold}
.lg .notice-box{background:rgba(15, 107, 92, 0.1);border-left:4px solid var(--accent);padding:10px 12px;border-radius:4px;margin-bottom:16px;font-size:.85rem}
.lg .btn-back{background:none;border:none;color:var(--muted);font:inherit;font-size:.85rem;cursor:pointer;margin-top:12px;text-decoration:underline;width:100%}
`;

export default function Login({ 
  onSendCode = enviarCodigoCorreo, 
  onVerifyCode = verificarCodigo 
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [step, setStep] = useState(1); // 1: Login, 2: Código 2FA, 3: Éxito
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  async function handleStep1Submit() {
   const e = {};
const cleanEmail = email.trim().toLowerCase();
const uvEmailRegex = /^[a-zA-Z0-9._%+-]+@(estudiantes\.)?uv\.mx$/;

if (!uvEmailRegex.test(cleanEmail)) {
  e.email = "Escribe un correo institucional válido (@uv.mx o @estudiantes.uv.mx).";
}
    if (password.length < 6) e.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const resp = await onSendCode(email.trim(), password);
      if (resp.ok) {
        setStep(2);
        setErrors({});
      } else {
        setErrors({ email: resp.message || "Credenciales incorrectas." });
      }
    } catch {
      setErrors({ password: "Error de conexión." });
    }
    setLoading(false);
  }

  async function handleStep2Submit() {
    if (authCode.trim().length !== 6) {
      setErrors({ code: "Debe ser de 6 dígitos." });
      return;
    }

    setLoading(true);
    try {
      const resp = await onVerifyCode(email.trim(), authCode.trim());
      if (resp.ok) {
        setUser(email.trim());
        setStep(3);
      } else {
        setErrors({ code: resp.message || "Número incorrecto." });
      }
    } catch {
      setErrors({ code: "Error de verificación." });
    }
    setLoading(false);
  }

  return (
    <div className="lg">
      <style>{css}</style>
      <main className="lg-card">
        {step === 3 ? (
          <section className="ok">
            <h1>Compraventas UV</h1>
            <p className="sub">Bienvenido(a), <strong>{user}</strong></p>
            <button type="button" onClick={() => { setStep(1); setAuthCode(""); }}>
              Cerrar sesión
            </button>
          </section>
        ) : step === 2 ? (
          <section>
            <h1>Autenticación</h1>
            <p className="sub">Código enviado a tu correo institucional:</p>
            <div className="notice-box">📧 <strong>{email}</strong></div>

            <label htmlFor="authCode">Número de autenticación</label>
            <input
              id="authCode"
              type="text"
              maxLength={6}
              className="code-input"
              placeholder="123456"
              value={authCode}
              onChange={(ev) => setAuthCode(ev.target.value)}
              aria-invalid={!!errors.code}
            />
            <p className="err" role="alert">{errors.code}</p>

            <button className="submit" type="button" onClick={handleStep2Submit} disabled={loading}>
              {loading ? "Verificando..." : "Ingresar"}
            </button>
            <button type="button" className="btn-back" onClick={() => setStep(1)}>
              ← Volver
            </button>
          </section>
        ) : (
          <section>
            <h1>Iniciar sesión</h1>
            <p className="sub">Plataforma Compraventas UV</p>

            <label htmlFor="email">Correo institucional</label>
            <input
              id="email"
              type="email"
              placeholder="usuario@estudiantes.uv.mx"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              aria-invalid={!!errors.email}
            />
            <p className="err" role="alert">{errors.email}</p>

            <label htmlFor="pass">Contraseña</label>
            <div className="pw">
              <input
                id="pass"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                aria-invalid={!!errors.password}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="err" role="alert">{errors.password}</p>

            <button className="submit" type="button" onClick={handleStep1Submit} disabled={loading}>
              {loading ? "Enviando..." : "Enviar código de acceso"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}