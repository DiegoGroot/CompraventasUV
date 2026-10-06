import { useEffect, useState } from 'react'
import { authService } from '../../services/auth.js'
import { catalogService } from '../../services/catalog.js'

const universityEmailPattern = /^[^\s@]+@(?:estudiantes\.)?uv\.mx$/i

export default function AuthForm({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [regions, setRegions] = useState([])
  const [faculties, setFaculties] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegistering = mode === 'register'

  useEffect(() => {
    let isCurrent = true
    catalogService.getRegions()
      .then((items) => { if (isCurrent) setRegions(items) })
      .catch((error) => { if (isCurrent) setCatalogError(error.message) })
      .finally(() => { if (isCurrent) setIsLoadingRegions(false) })
    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    if (!selectedRegion) return undefined

    const controller = new AbortController()
    catalogService.getFaculties(selectedRegion, { signal: controller.signal })
      .then((items) => setFaculties(items))
      .catch((error) => {
        if (error.name !== 'AbortError') setCatalogError(error.message)
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoadingFaculties(false) })
    return () => controller.abort()
  }, [selectedRegion])

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const username = String(formData.get('username') || '').trim()
    const identifier = String(formData.get('identifier') || '').trim()

    if (isRegistering && !universityEmailPattern.test(email)) {
      setFeedback({ type: 'error', text: 'Usa un correo universitario de la UV.' })
      return
    }
    if (isRegistering && username.length < 3) {
      setFeedback({ type: 'error', text: 'El nombre de usuario debe tener al menos 3 caracteres.' })
      return
    }
    if (isRegistering && password.length < 8) {
      setFeedback({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    if (isRegistering && (!selectedRegion || !selectedFaculty)) {
      setFeedback({ type: 'error', text: 'Selecciona tu región y facultad.' })
      return
    }

    setIsSubmitting(true)
    try {
      if (isRegistering) {
        await authService.register({ username, email, password, regionId: selectedRegion, facultyId: selectedFaculty })
      } else {
        await authService.login({ identifier, password })
      }
      setFeedback({ type: 'success', text: isRegistering ? 'Cuenta creada correctamente.' : 'Sesión iniciada correctamente.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'No se pudo conectar con el servicio.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="auth-heading"><h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2><p>{isRegistering ? 'Únete al mercado de la comunidad UV.' : 'Entra con tu correo universitario.'}</p></div>
      <div className="mode-switch" role="tablist" aria-label="Acceso o registro">
        <button type="button" role="tab" aria-selected={!isRegistering} className={!isRegistering ? 'active' : ''} onClick={() => setMode('login')}>Entrar</button>
        <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {isRegistering ? (
          <>
            <label htmlFor="auth-email">Correo universitario</label>
            <input id="auth-email" name="email" type="email" placeholder="nombre@estudiantes.uv.mx" autoComplete="email" autoCapitalize="none" spellCheck="false" required />
            <label className="username-label" htmlFor="auth-username">Nombre de usuario</label>
            <input id="auth-username" name="username" type="text" placeholder="Tu nombre público" autoComplete="username" minLength={3} maxLength={30} required />
          </>
        ) : (
          <>
            <label htmlFor="auth-identifier">Correo o nombre de usuario</label>
            <input id="auth-identifier" name="identifier" type="text" placeholder="Correo universitario o usuario" autoComplete="username" required />
          </>
        )}
        {isRegistering && (
          <div className="profile-fields">
            <div className="profile-field">
              <label htmlFor="auth-region">Región</label>
              <select id="auth-region" value={selectedRegion} onChange={(event) => { const regionId = event.target.value; if (regionId === selectedRegion) return; setSelectedRegion(regionId); setSelectedFaculty(''); setFaculties([]); setIsLoadingFaculties(Boolean(regionId)); setCatalogError('') }} disabled={isLoadingRegions || regions.length === 0} required>
                <option value="">{isLoadingRegions ? 'Cargando…' : 'Selecciona'}</option>
                {regions.map((region) => <option key={region.id} value={region.id}>{region.nombre}</option>)}
              </select>
            </div>
            <div className="profile-field">
              <label htmlFor="auth-faculty">Facultad</label>
              <select id="auth-faculty" value={selectedFaculty} onChange={(event) => setSelectedFaculty(event.target.value)} disabled={!selectedRegion || isLoadingFaculties} required>
                <option value="">{!selectedRegion ? 'Selecciona región' : isLoadingFaculties ? 'Cargando…' : 'Selecciona'}</option>
                {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.nombre}</option>)}
              </select>
            </div>
            {catalogError && <p className="feedback feedback-error" role="alert">{catalogError}</p>}
          </div>
        )}
        <div className="password-label-row"><label htmlFor="auth-password">Contraseña</label>{!isRegistering && <button className="text-button" type="button" onClick={() => setFeedback({ type: 'info', text: 'La recuperación de contraseña estará disponible próximamente.' })}>¿La olvidaste?</button>}</div>
        <div className="password-input"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Al menos 8 caracteres" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={isRegistering ? 8 : undefined} required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div>
        {feedback && <p className={`feedback feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
        <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Conectando…' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</button>
      </form>
    </>
  )
}