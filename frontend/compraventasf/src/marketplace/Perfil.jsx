import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Pencil, Star, Tag } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { usePreferences, ACCENTS } from '../context/PreferencesContext.jsx'
import './perfil.css'

const CAMPOS = [
  { key: 'nombre', label: 'Nombre completo' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'facultad', label: 'Facultad' },
  { key: 'campus', label: 'Campus' },
  { key: 'telefono', label: 'Teléfono de contacto' },
]

function CampoEditable({ label, value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function guardar(event) {
    event.preventDefault()
    onSave(draft.trim())
    setEditing(false)
  }

  return (
    <div className="campo">
      <div className="campo__text">
        <span>{label}</span>
        {editing ? (
          <form onSubmit={guardar}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
          </form>
        ) : (
          <strong>{value}</strong>
        )}
      </div>
      {editing ? (
        <button type="button" onClick={guardar}>Guardar</button>
      ) : (
        <button type="button" onClick={() => { setDraft(value); setEditing(true) }}>Editar</button>
      )}
    </div>
  )
}

export default function Perfil() {
  const { user, initials, updateUser } = useUser()
  const { accentId, setAccentId, collapsed, toggleCollapsed } = usePreferences()
  const [tab, setTab] = useState('perfil')

  if (!user) return <p>Inicia sesión para ver tu perfil.</p>

  return (
    <div className="perfil">
      <section className="card perfil__head">
        <div className="perfil__avatar">
          {initials}
          <span><Pencil size={14} /></span>
        </div>
        <div>
          <h2>{user.nombre.split(' ').slice(0, 2).join(' ')}</h2>
          <p>{user.email}</p>
          <p className="perfil__muted">Facultad de {user.facultad} · {user.campus}</p>
        </div>
      </section>

      <div className="segmented">
        <button className={tab === 'perfil' ? 'is-active' : ''} onClick={() => setTab('perfil')}>Perfil</button>
        <button className={tab === 'config' ? 'is-active' : ''} onClick={() => setTab('config')}>Configuración</button>
      </div>

      {tab === 'perfil' ? (
        <>
          <section className="card">
            {CAMPOS.map(({ key, label }) => (
              <CampoEditable
                key={key}
                label={label}
                value={user[key]}
                onSave={(value) => updateUser({ [key]: value })}
              />
            ))}
          </section>

          <section className="card perfil__row">
            <div>
              <strong>Valoración como vendedor</strong>
              <div className="perfil__stars">
                {Array.from({ length: user.rating }, (_, i) => (
                  <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                ))}
                <span>({user.resenas})</span>
              </div>
            </div>
            <Link to="/mi-espacio">Ver todas</Link>
          </section>

          <Link to="/mi-espacio" className="card perfil__link">
            <span className="perfil__link-icon"><Tag size={22} /></span>
            <div>
              <strong>Mis publicaciones</strong>
              <p>{user.publicados} productos publicados</p>
            </div>
            <ChevronRight size={20} />
          </Link>
        </>
      ) : (
        <section className="card config">
          <div className="config__block">
            <strong>Color de la aplicación</strong>
            <p>Elige el color principal de la interfaz.</p>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.label}
                  aria-label={a.label}
                  className={accentId === a.id ? 'is-active' : ''}
                  style={{ background: a.main }}
                  onClick={() => setAccentId(a.id)}
                >
                  {accentId === a.id && <Check size={18} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          <div className="config__block config__inline">
            <div>
              <strong>Menú lateral contraído</strong>
              <p>Muestra solo los iconos para tener más espacio.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={collapsed}
              className={`switch ${collapsed ? 'is-on' : ''}`}
              onClick={toggleCollapsed}
            />
          </div>
        </section>
      )}
    </div>
  )
}