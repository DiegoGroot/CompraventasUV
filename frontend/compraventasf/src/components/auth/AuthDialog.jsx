import { useEffect } from 'react'
import AuthForm from './AuthForm.jsx'
import { useUser } from '../../context/UserContext.jsx'

export default function AuthDialog({ initialMode, onClose }) {
  const { login } = useUser()

  useEffect(() => {
    function handleKeyDown(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-label="Acceso a Compraventas UV">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="dialog-brand"><img src="/brand-mark.svg" alt="" /><span>compraventas <strong>uv</strong></span></div>
        <AuthForm
          key={initialMode}
          initialMode={initialMode}
          onSuccess={(usuario) => { login(usuario); onClose() }}
        />
      </section>
    </div>
  )
}