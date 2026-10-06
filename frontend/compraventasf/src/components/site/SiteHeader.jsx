export default function SiteHeader({ searchValue, onSearchChange, onSignIn, onPublish }) {
  return (
    <header className="site-header">
      <a className="site-brand" href="/" aria-label="Compraventas UV, inicio">
        <img src="/brand-mark.svg" alt="" />
        <span>compraventas <strong>uv</strong></span>
      </a>
      <label className="site-search">
        <span aria-hidden="true">⌕</span>
        <input type="search" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar artículos..." aria-label="Buscar artículos" />
        <kbd>/</kbd>
      </label>
      <nav className="site-actions" aria-label="Cuenta">
        <button className="sign-in-button" type="button" onClick={onSignIn}>Entrar</button>
        <button className="publish-button" type="button" onClick={onPublish}><span aria-hidden="true">＋</span> Publicar</button>
      </nav>
    </header>
  )
}