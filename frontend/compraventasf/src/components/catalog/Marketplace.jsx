import { useState } from "react";
import CreateProduct from "./CreateProduct";

const css = `
.app-layout{display:flex;min-height:100vh;background:#f8faf9;color:#16302b;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}
.app-layout *{box-sizing:border-box}

/* SIDEBAR LEFT */
.sidebar{width:260px;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;justify-content:space-between;padding:24px 16px;position:sticky;top:0;height:100vh}
.sidebar-logo{display:flex;align-items:center;gap:12px;margin-bottom:28px;padding:0 8px}
.logo-icon{background:#0f6b5c;color:#fff;font-weight:700;font-size:.85rem;padding:6px 10px;border-radius:6px}
.logo-title{font-size:1rem;font-weight:700;line-height:1.2}
.logo-sub{font-size:.75rem;color:#5d716c;display:block}

.nav-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.nav-item button{width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;background:transparent;border-radius:8px;color:#5d716c;font:inherit;font-size:.9rem;font-weight:500;cursor:pointer;transition:all .15s}
.nav-item button:hover{background:#f0f4f3;color:#16302b}
.nav-item.active button{background:#e6f2f0;color:#0f6b5c;font-weight:600}

.btn-publish{width:100%;margin-top:16px;background:#0f6b5c;color:#fff;border:0;padding:12px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s}
.btn-publish:hover{background:#0b5145}

.user-profile{display:flex;align-items:center;justify-content:space-between;padding:12px 8px;border-top:1px solid #e2e8f0;margin-top:16px}
.user-avatar{background:#c9d6d3;color:#0f6b5c;font-weight:700;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:.85rem}
.user-info{font-size:.82rem}
.user-name{font-weight:600;display:block;color:#16302b}
.user-faculty{color:#5d716c;font-size:.75rem}
.btn-logout{background:none;border:none;color:#5d716c;font-size:.78rem;cursor:pointer;padding:0;text-decoration:underline}

/* MAIN CONTENT */
.main-content{flex:1;padding:32px;overflow-y:auto}

/* BANNER DE BÚSQUEDA */
.hero-banner{background:#0f6b5c;color:#fff;border-radius:16px;padding:36px 32px;margin-bottom:32px}
.hero-tag{font-size:.85rem;color:rgba(255,255,255,0.8);margin-bottom:4px}
.hero-title{font-size:2rem;font-weight:700;margin:0 0 4px}
.hero-sub{font-size:.95rem;color:rgba(255,255,255,0.85);margin:0 0 24px}

.search-box{display:flex;gap:8px;background:#fff;border-radius:10px;padding:6px 6px 6px 16px;align-items:center}
.search-input{flex:1;border:none;font:inherit;font-size:.95rem;outline:none;color:#16302b}
.btn-search{background:#0f6b5c;color:#fff;border:none;padding:10px 24px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}

/* CATEGORÍAS */
.section-title{font-size:1.2rem;font-weight:700;margin:0 0 16px}
.categories-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-bottom:36px}
.cat-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 12px;text-align:center;cursor:pointer;transition:transform .15s,box-shadow .15s}
.cat-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.05);border-color:#0f6b5c}
.cat-icon{font-size:1.6rem;margin-bottom:8px;display:block}
.cat-label{font-size:.85rem;font-weight:600;color:#16302b}

/* CARDS DE PRODUCTOS PUBLICADOS */
.posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-top:16px}
.product-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;transition:box-shadow .15s,transform .15s}
.product-card:hover{box-shadow:0 6px 16px rgba(0,0,0,0.06);transform:translateY(-2px)}
.product-img{height:190px;width:100%;object-fit:cover;background:#e2e8f0}
.product-body{padding:16px}
.product-badge-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.product-category{background:rgba(15,107,92,0.1);color:#0f6b5c;font-size:.75rem;font-weight:700;padding:4px 8px;border-radius:6px}
.product-status{font-size:.75rem;color:#5d716c;font-weight:500}
.product-title{font-size:1.05rem;font-weight:700;margin:0 0 6px;color:#16302b}
.product-price{font-size:1.25rem;font-weight:800;color:#0f6b5c;margin-bottom:12px}
.product-vendor{font-size:.8rem;color:#5d716c;border-top:1px solid #f0f4f3;padding-top:10px;display:flex;align-items:center;justify-content:space-between}

/* EMPTY STATE */
.empty-state-box{background:#fff;border:2px dashed #cbd5e1;border-radius:16px;padding:48px 24px;text-align:center;margin-top:12px}
.empty-icon{font-size:2.8rem;margin-bottom:12px;display:block}
.empty-title{font-size:1.1rem;font-weight:700;color:#16302b;margin:0 0 6px}
.empty-desc{font-size:.9rem;color:#5d716c;max-width:400px;margin:0 auto 20px;line-height:1.4}
.btn-empty-action{background:#0f6b5c;color:#fff;border:none;padding:10px 20px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.btn-empty-action:hover{background:#0b5145}
`;

export default function Marketplace({ userEmail = "zs24003958@estudiantes.uv.mx", onLogout }) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [currentView, setCurrentView] = useState("catalog"); // "catalog" o "create"
  const [searchTerm, setSearchTerm] = useState("");
  
  // Lista dinámica de productos/puestos
  const [posts, setPosts] = useState([]);

  const categories = [
    { icon: "📚", label: "Libros" },
    { icon: "💻", label: "Electrónica" },
    { icon: "👕", label: "Ropa" },
    { icon: "✏️", label: "Útiles" },
    { icon: "⚽", label: "Deporte" },
    { icon: "🎸", label: "Instrumentos" },
    { icon: "🌮", label: "Comida" },
    { icon: "📦", label: "Otras" }
  ];

  function handleCreateProduct(newProduct) {
    setPosts((prev) => [newProduct, ...prev]);
    setCurrentView("catalog");
  }

  return (
    <div className="app-layout">
      <style>{css}</style>

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <span className="logo-icon">UV</span>
            <div>
              <span className="logo-title">Compraventas</span>
              <span className="logo-sub">Universidad Veracruzana</span>
            </div>
          </div>

          <ul className="nav-list">
            {[
              { id: "inicio", label: "Inicio", icon: "🏠" },
              { id: "explorar", label: "Explorar", icon: "🔍" },
              { id: "puestos", label: "Puestos", icon: "🏪" },
              { id: "favoritos", label: "Favoritos", icon: "🤍" },
              { id: "carrito", label: "Carrito", icon: "🛒" },
              { id: "compras", label: "Mis compras", icon: "🛍️" },
              { id: "mensajes", label: "Mensajes", icon: "💬" },
              { id: "reportes", label: "Mis reportes", icon: "🚩" },
              { id: "espacio", label: "Mi espacio", icon: "💼" },
              { id: "perfil", label: "Perfil", icon: "👤" }
            ].map((item) => (
              <li key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`}>
                <button onClick={() => { setActiveTab(item.id); setCurrentView("catalog"); }}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <button className="btn-publish" onClick={() => setCurrentView("create")}>
            <span>+</span> Publicar
          </button>
        </div>

        {/* USUARIO EN BOTTOM */}
        <div className="user-profile">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="user-avatar">JA</div>
            <div className="user-info">
              <span className="user-name">Jessica Ayelén</span>
              <span className="user-faculty">Ingeniería · Orizaba</span>
            </div>
          </div>
          <button className="btn-logout" title="Cerrar sesión" onClick={onLogout}>
            Salir
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {currentView === "create" ? (
          <CreateProduct
            onBack={() => setCurrentView("catalog")}
            onCreateProduct={handleCreateProduct}
          />
        ) : (
          <>
            {/* BANNER DE BÚSQUEDA */}
            <header className="hero-banner">
              <div className="hero-tag">Universidad Veracruzana</div>
              <h1 className="hero-title">Compra y vende</h1>
              <p className="hero-sub">Conectando a la comunidad UV</p>

              <div className="search-box">
                <span style={{ color: "#5d716c" }}>🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar libros, electrónica, ropa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-search">Buscar</button>
              </div>
            </header>

            {/* SECCIÓN CATEGORÍAS */}
            <section>
              <h2 className="section-title">Categorías</h2>
              <div className="categories-grid">
                {categories.map((cat, idx) => (
                  <div key={idx} className="cat-card">
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECCIÓN PUBLICACIONES DESTACADAS */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="section-title" style={{ margin: 0 }}>Publicaciones recientes</h2>
              </div>

              {posts.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">🏪</span>
                  <h3 className="empty-title">Aún no hay puestos publicados</h3>
                  <p className="empty-desc">
                    Sé la primera persona en la Facultad de Ingeniería en publicar un artículo o abrir un puesto para la comunidad.
                  </p>
                  <button className="btn-empty-action" onClick={() => setCurrentView("create")}>
                    + Crear el primer puesto
                  </button>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <article key={post.id} className="product-card">
                      <img src={post.image} alt={post.title} className="product-img" />
                      <div className="product-body">
                        <div className="product-badge-row">
                          <span className="product-category">{post.category}</span>
                          <span className="product-status">Estado: {post.status}</span>
                        </div>
                        <h3 className="product-title">{post.title}</h3>
                        <div className="product-price">\${post.price} MXN</div>
                        <div className="product-vendor">
                          <span>👤 {post.vendor}</span>
                          <span>📍 Orizaba</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}