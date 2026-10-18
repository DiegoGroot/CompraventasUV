import { useState } from "react";
import { enviarCodigoCorreo, verificarCodigo } from "../../services/authService";

const css = `
.auth-container{min-height:100vh;display:flex;background:#fff;font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;box-sizing:border-box}
.auth-container *{box-sizing:border-box}

/* Columna Izquierda: Branding institucional */
.auth-brand{flex:1;background:#0f6b5c;color:#fff;padding:48px;display:flex;flex-direction:column;justify-content:space-between;display:none}
@media(min-width:900px){.auth-brand{display:flex}}
.auth-brand-top{display:flex;align-items:center;gap:12px}
.auth-brand-badge{background:rgba(255,255,255,0.2);padding:6px 12px;border-radius:6px;font-weight:700;font-size:.9rem}
.auth-brand-title{font-size:2.8rem;line-height:1.2;font-weight:700;margin:0 0 16px;max-width:480px}
.auth-brand-desc{font-size:1rem;line-height:1.5;color:rgba(255,255,255,0.85);max-width:420px;margin:0}
.auth-brand-footer{font-size:.85rem;color:rgba(255,255,255,0.7)}

/* Columna Derecha: Formularios */
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

.code-input{letter-spacing:10px;font-size:1.4rem;text-align:center;font-weight:bold}
.notice-box{background:rgba(15,107,92,0.08);border-left:4px solid #0f6b5c;padding:12px;border-radius:4px;margin-bottom:20px;font-size:.9rem;color:#16302b}
`;

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("login"); // "login", "register", "verify", "success"
  
  // Estados para Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para Registro
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [region, setRegion] = useState("Orizaba-Córdoba");
  const [faculty, setFaculty] = useState("Facultad de Ingeniería");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado para verificación 2FA
  const [authCode, setAuthCode] = useState("");
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Manejar envío de Login (Paso 1)
  async function handleLoginSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!email.trim().toLowerCase().endsWith("uv.mx")) {
      errs.email = "Debe ser un correo institucional UV válido.";
    }
    if (password.length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const resp = await enviarCodigoCorreo(email.trim(), password);
      if (resp.ok) {
        setStep("verify");
        setErrors({});
      } else {
        setErrors({ email: resp.message || "Credenciales incorrectas." });
      }
    } catch {
      setErrors({ password: "Error de conexión con el servidor." });
    }
    setLoading(false);
  }

  // Manejar verificación de código (Paso 2)
  async function handleVerifySubmit(e) {
    e.preventDefault();
    if (authCode.trim().length !== 6) {
      setErrors({ code: "El código debe constar de 6 dígitos." });
      return;
    }

    setLoading(true);
    try {
      const resp = await verificarCodigo(email.trim(), authCode.trim());
      if (resp.ok) {
        if (onLoginSuccess) onLoginSuccess(email.trim());
        setStep("success");
      } else {
        setErrors({ code: resp.message || "Código incorrecto." });
      }
    } catch {
      setErrors({ code: "Error al verificar el código." });
    }
    setLoading(false);
  }

  // Manejar Registro
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim()) errs.name = "Ingresa tu nombre completo.";
    if (!regEmail.trim().toLowerCase().endsWith("uv.mx")) {
      errs.regEmail = "Debe ser un correo institucional UV (@uv.mx o @estudiantes.uv.mx).";
    }
    if (regPassword.length < 8) errs.regPassword = "Mínimo 8 caracteres y un número.";
    if (regPassword !== confirmPassword) errs.confirm = "Las contraseñas no coinciden.";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    // Simulamos registro exitoso y pasamos a login
    setTimeout(() => {
      setLoading(false);
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      setStep("login");
      setEmail(regEmail);
    }, 800);
  }

  return (
    <div className="auth-container">
      <style>{css}</style>

      {/* COLUMNA IZQUIERDA: Banner institucional idéntico al Figma */}
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
        <div className="auth-brand-footer">
          Lis de Veracruz: Arte, Ciencia, Luz
        </div>
      </div>

      {/* COLUMNA DERECHA: Dinámica de pantallas */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          
          {/* PANTALLA 1: INICIAR SESIÓN */}
          {step === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <h1>Bienvenido de vuelta</h1>
              <p className="sub">Inicia sesión con tu cuenta institucional.</p>

              <label htmlFor="email">Correo institucional</label>
              <input
                id="email"
                type="email"
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

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <span style={{ fontSize: "0.9rem", color: "#5d716c" }}>¿No tienes cuenta? </span>
                <button type="button" className="auth-link-btn" onClick={() => { setStep("register"); setErrors({}); }}>
                  Regístrate
                </button>
              </div>
            </form>
          )}

          {/* PANTALLA 2: CREAR CUENTA (REGISTRO) */}
          {step === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <h1>Crea tu cuenta</h1>
              <p className="sub">Una sola cuenta para comprar y vender dentro de la UV.</p>

              <label htmlFor="fullName">Nombre completo</label>
              <input
                id="fullName"
                type="text"
                placeholder="Jessica Ayelén"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
              <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="Orizaba-Córdoba">Orizaba-Córdoba</option>
                <option value="Xalapa">Xalapa</option>
                <option value="Veracruz">Veracruz</option>
                <option value="Poza Rica-Tuxpan">Poza Rica-Tuxpan</option>
                <option value="Coatzacoalcos-Minatitlán">Coatzacoalcos-Minatitlán</option>
              </select>

              <label htmlFor="faculty" style={{ marginTop: "14px" }}>Facultad *</label>
              <select id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                <option value="Facultad de Ingeniería">Facultad de Ingeniería</option>
                <option value="Facultad de Negocios y Tecnologías">Facultad de Negocios y Tecnologías</option>
                <option value="Facultad de Contaduría">Facultad de Contaduría</option>
              </select>
              <p className="auth-hint">Facultades de la región {region}.</p>

              <label htmlFor="regPass">Contraseña</label>
              <input
                id="regPass"
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <p className="auth-hint">Mínimo 8 caracteres y un número.</p>
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

          {/* PANTALLA 3: VERIFICA TU CORREO (2FA) */}
          {step === "verify" && (
            <form onSubmit={handleVerifySubmit}>
              <h1>Verifica tu correo</h1>
              <p className="sub">Enviamos un código de 6 dígitos a:</p>
              <div className="notice-box">
                📧 <strong>{email}</strong> <br/>
                <span style={{ fontSize: "0.8rem", color: "#5d716c" }}>(Demo: usa el código 123456)</span>
              </div>

              <label htmlFor="authCode">Código de verificación</label>
              <input
                id="authCode"
                type="text"
                maxLength={6}
                className="code-input"
                placeholder="123456"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                aria-invalid={!!errors.code}
              />
              <p className="auth-err">{errors.code}</p>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar y entrar"}
              </button>

              <button type="button" className="auth-back-btn" onClick={() => { setStep("login"); setAuthCode(""); }}>
                ← Volver a iniciar sesión
              </button>
            </form>
          )}

          {/* PANTALLA 4: ÉXITO */}
          {step === "success" && (
            <div style={{ textAlign: "center" }}>
              <h1>¡Bienvenido(a)!</h1>
              <p className="sub">Has ingresado correctamente a Compraventas UV.</p>
              <button 
                className="auth-submit" 
                type="button" 
                onClick={() => { setStep("login"); setAuthCode(""); setPassword(""); }}
              >
                Cerrar sesión (Volver)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}