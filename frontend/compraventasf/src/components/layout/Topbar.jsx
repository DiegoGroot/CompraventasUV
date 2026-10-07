export default function Topbar({ title, onSignIn }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar__actions">
        <button type="button" className="topbar__signin" onClick={onSignIn}>
          Entrar
        </button>
        <div className="avatar">MR</div>
      </div>
    </header>
  )
}