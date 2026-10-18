import { useState, useEffect } from "react";
import { login, registrar, obtenerRegiones, obtenerFacultades } from "../../services/authService";

const css = `
.auth-container{min-height:100vh;display:flex;background:#fff;font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;box-sizing:border-box}
.auth-container *{box-sizing:border-box}
.auth-brand{flex:1;background:#0f6b5c;color:#fff;padding:48px;display:flex;flex-direction:column;justify-content:space-between;display:none}
@media(min-width:900px){.auth-brand{display:flex}}
.auth-brand-top{display:flex;align-items:center;gap:12px}
.auth-brand-badge{background:rgba(255,255,255,0.2);padding:6px 12px;border-radius:6px;font-weight:700;font-size:.9rem}
.auth-brand-title{font-size:2.8rem;line-height:1.2;font-weight:700;margin:0 0 16px;max-width:480px}
.auth-brand-desc{font-size:1rem;line-height:1.5;color:rgba(255,255,255,0.85);max-width:420px;margin:0}
.auth-brand-footer{font-size:.85rem;color:rgba(255,255,255,0.7)}
.auth-form-side{flex:1;display:flex;align-items:center;justify-content:center;padding:32px;overflow-y:auto}
.auth-form-box{width:100%;max-width:420px}
.auth-form-box h1{font-size:1.8rem;font-weight:700;color:#16302b;margin:0 0 8px}
.auth-form-box .sub{color:#5d716c;font-size:.95rem;margin:0 0 24px}
.auth-form-box label{display:block;font-weight:600;font-size:.85rem;color:#16302b;margin:16px 0 6px}
.auth-form-box input,.auth-form-box select{width:100%;font:inherit;color:#16302b;background:#fff;border:1px solid #c9d6d3;border-radius:8px;padding:12px;font-size:.95rem}
.auth-form-box input:focus-visible,.auth-form-box select:focus-visible{outline:2px solid #0f6b5c;outline-offset:1px}
.auth-form-box input[aria-invalid="true"]{border-color:#b3261e}
.auth-hint{font-size:.78rem;color:#5d716c;margin-top:4px}
.auth-err{color:#b3261e;font-size:.82rem;margin-top:4px;min-height:1.2em}
.auth-submit{width:100%;margin-top:24px;padding:12px;font:inherit;font-weight:600;background:#0f6b5c;color:#fff;border:0;border-radius:8px;cursor:pointer;transition:background .2s}
.auth-submit:hover{background:#0b5145}
.auth-submit:disabled{opacity:.6;cursor:default}
.auth-link-btn{background:none;border:none;color:#0f6b5c;font:inherit;font-weight:600;cursor:pointer;padding:0;text-decoration:underline;margin-top:16px;display:inline-block}
.auth-back-btn{background:none;border:none;color:#5d716c;font:inherit;cursor:pointer;margin-top:16px;display:block;width:100%;text-align:center;text-decoration:underline}
.auth-guest{width:100%;margin-top:12px;padding:12px;font:inherit;font-weight:600;background:#fff;color:#0f6b5c;border:2px solid #0f6b5c;border-radius:8px;cursor:pointer}
.auth-guest:hover{background:rgba(15,107,92,.08)}
`;

const getId = (o) => o.id ?? o.ID;
const getNombre = (o) => o.nombre ?? o.Nombre;

export default function Login({ onLoginSuccess, onGuest }) {
  const [step, setStep] = useState("login"); // "login" | "register"

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registro
  const [username, setUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regiones, setRegiones] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [regionId, setRegionId] = useState("");
  const [facultadId, setFacultadId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerRegiones().then((r) => {
      if (r.ok && Array.isArray(r.data)) setRegiones(r.data);
    });
  }, []);

  useEffect(() => {
    setFacultades([]);
    setFacultadId("");
    if (!regionId) return;
    obtenerFacultades(regionId).then((r) => {
      if (r.ok && Array.isArray(r.data)) setFacultades(r.data);
    });
  }, [regionId]);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Ingresa tu correo o usuario.";
    if (!password) errs.password = "Ingresa tu contraseña.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Los correos siempre en minúsculas; el username se deja tal cual
    const ident = email.trim();
    const identificador = ident.includes("@") ? ident.toLowerCase() : ident;

    setLoading(true);
    const resp = await login(identificador, password);
    setLoading(false);

    if (resp.ok) {
      localStorage.setItem("token", resp.data.token);
      if (onLoginSuccess) onLoginSuccess(resp.data.usuario);
    } else {
      setErrors({ password: resp.message || "Credenciales incorrectas." });
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (username.trim().length < 3) errs.name = "Mínimo 3 caracteres.";
    if (!regEmail.trim().toLowerCase().endsWith("uv.mx")) {
      errs.regEmail = "Debe ser un correo institucional UV (@uv.mx o @estudiantes.uv.mx).";
    }
    if (!regionId || !facultadId) errs.region = "Selecciona región y facultad.";
    if (regPassword.length < 8) errs.regPassword = "Mínimo 8 caracteres.";
    if (regPassword !== confirmPassword) errs.confirm = "Las contraseñas no coinciden.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const correo = regEmail.trim().toLowerCase();
    const resp = await registrar({
      username: username.trim(),
      correo,
      password: regPassword,
      region_id: Number(regionId),
      facultad_id: Number(facultadId),
    });
    setLoading(false);

    if (resp.ok) {
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      setEmail(correo);
      setPassword("");
      setStep("login");
      setErrors({});
    } else {
      setErrors({ regEmail: resp.message || "No se pudo crear la cuenta." });
    }
  }

  return (
    <div className="auth-container">
      <style>{css}</style>

      <div className="auth-brand">
        <div className="auth-brand-top">
          <div className="auth-brand-badge">UV</div>
          <span style={{ fontWeight: 600, letterSpacing: "0.5px" }}>Compraventas UV</span>
        </div>
        <div>
          <h2 className="auth-brand-title">Lo que necesitas, entre compañeros.</h2>
          <p className="auth-brand-desc">
            Compra y vende libros, material y comida dentro de la comunidad de la Universidad Veracruzana. Solo con cuenta institucional.
          </p>
        </div>
        <div className="auth-brand-footer">Lis de Veracruz: Arte, Ciencia, Luz</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">

          {step === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <h1>Bienvenido de vuelta</h1>
              <p className="sub">Inicia sesión con tu cuenta institucional.</p>

              <label htmlFor="email">Correo institucional o usuario</label>
              <input
                id="email"
                type="text"
                placeholder="zs26003954@estudiantes.uv.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              <p className="auth-err">{errors.email}</p>

              <label htmlFor="pass">Contraseña</label>
              <input
                id="pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <p className="auth-err">{errors.password}</p>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar sesión"}
              </button>

              {onGuest && (
                <button type="button" className="auth-guest" onClick={onGuest}>
                  Explorar sin iniciar sesión
                </button>
              )}

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <span style={{ fontSize: "0.9rem", color: "#5d716c" }}>¿No tienes cuenta? </span>
                <button type="button" className="auth-link-btn" onClick={() => { setStep("register"); setErrors({}); }}>
                  Regístrate
                </button>
              </div>
            </form>
          )}

          {step === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <h1>Crea tu cuenta</h1>
              <p className="sub">Una sola cuenta para comprar y vender dentro de la UV.</p>

              <label htmlFor="username">Nombre de usuario</label>
              <input
                id="username"
                type="text"
                placeholder="jessica_ayelen"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="auth-err">{errors.name}</p>

              <label htmlFor="regEmail">Correo institucional</label>
              <input
                id="regEmail"
                type="email"
                placeholder="zs24003958@estudiantes.uv.mx"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <p className="auth-hint">Estudiantes: @estudiantes.uv.mx · Académicos: @uv.mx</p>
              <p className="auth-err">{errors.regEmail}</p>

              <label htmlFor="region">Región *</label>
              <select id="region" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">Selecciona...</option>
                {regiones.map((r) => (
                  <option key={getId(r)} value={getId(r)}>{getNombre(r)}</option>
                ))}
              </select>

              <label htmlFor="faculty" style={{ marginTop: "14px" }}>Facultad *</label>
              <select id="faculty" value={facultadId} onChange={(e) => setFacultadId(e.target.value)}>
                <option value="">Selecciona...</option>
                {facultades.map((f) => (
                  <option key={getId(f)} value={getId(f)}>{getNombre(f)}</option>
                ))}
              </select>
              <p className="auth-err">{errors.region}</p>

              <label htmlFor="regPass">Contraseña</label>
              <input
                id="regPass"
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <p className="auth-hint">Mínimo 8 caracteres.</p>
              <p className="auth-err">{errors.regPassword}</p>

              <label htmlFor="confirmPass">Confirmar contraseña</label>
              <input
                id="confirmPass"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="auth-err">{errors.confirm}</p>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <button type="button" className="auth-back-btn" onClick={() => { setStep("login"); setErrors({}); }}>
                ← Volver a iniciar sesión
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}