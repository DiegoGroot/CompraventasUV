import { useState } from "react";

const css = `
.create-pub-container{max-width:720px;margin:0 auto;padding:12px 0 40px}
.back-link{background:none;border:none;color:#5d716c;font:inherit;font-size:.9rem;cursor:pointer;display:flex;align-items:center;gap:6px;margin-bottom:16px;padding:0}
.back-link:hover{color:#0f6b5c}

.pub-title{font-size:1.8rem;font-weight:700;color:#16302b;margin:0 0 24px}
.pub-section-label{display:block;font-weight:600;font-size:.9rem;color:#16302b;margin:20px 0 8px}
.pub-subtext{font-size:.78rem;color:#5d716c;margin-top:6px;margin-bottom:16px}

/* GRID DE FOTOS */
.photos-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}
.photo-box-main,.photo-box-sub{border:2px dashed #cbd5e1;border-radius:12px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:border-color .15s,background .15s;color:#5d716c;text-align:center;padding:8px;position:relative;overflow:hidden}
.photo-box-main{height:210px;grid-row:span 2}
.photo-box-sub{height:99px}
.photo-box-main:hover,.photo-box-sub:hover{border-color:#0f6b5c;background:rgba(15,107,92,0.02);color:#0f6b5c}
.plus-icon{font-size:1.5rem;font-weight:300;margin-bottom:4px}

.preview-img{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0}
.remove-img-btn{position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;display:grid;place-items:center;font-size:.75rem;z-index:2}

/* INPUTS FORMULARIO */
.pub-input,.pub-textarea,.pub-select{width:100%;font:inherit;color:#16302b;background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-size:.95rem;box-sizing:border-box}
.pub-input:focus,.pub-textarea:focus{outline:2px solid #0f6b5c;outline-offset:1px}
.pub-textarea{min-height:110px;resize:vertical}

.row-dual{display:grid;grid-template-columns:1fr 1fr;gap:16px}

/* CATEGORÍAS SELECTOR */
.categories-selector{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.cat-btn{background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:12px 8px;text-align:center;cursor:pointer;transition:all .15s;color:#16302b}
.cat-btn:hover{border-color:#0f6b5c;background:#f0f4f3}
.cat-btn.selected{border:2px solid #0f6b5c;background:rgba(15,107,92,0.06);font-weight:600}
.cat-btn span{display:block}

/* ESTADO DEL PRODUCTO */
.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.status-card{background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:12px 16px;cursor:pointer;transition:all .15s;text-align:left}
.status-card:hover{border-color:#0f6b5c}
.status-card.selected{border:2px solid #0f6b5c;background:rgba(15,107,92,0.06)}
.status-title{font-weight:700;font-size:.88rem;color:#16302b;display:block;margin-bottom:2px}
.status-desc{font-size:.78rem;color:#5d716c;display:block}

/* ACCIONES */
.pub-actions{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px}
.btn-draft{background:#fff;border:1px solid #cbd5e1;color:#16302b;padding:12px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.btn-publish-submit{background:#0f6b5c;color:#fff;border:none;padding:12px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.btn-publish-submit:hover{background:#0b5145}
`;

export default function CreateProduct({ onBack, onCreateProduct }) {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState("Libros");
  const [selectedStatus, setSelectedStatus] = useState("Nuevo");

  const categories = [
    { icon: "📚", label: "Libros" },
    { icon: "💻", label: "Electrónica" },
    { icon: "👕", label: "Ropa" },
    { icon: "✏️", label: "Útiles" },
    { icon: "⚽", label: "Deporte" },
    { icon: "🎸", label: "Instrumentos" },
    { icon: "🌮", label: "Comida" },
    { icon: "📦", label: "Otros" }
  ];

  const statusOptions = [
    { id: "Nuevo", title: "Nuevo", desc: "Sin uso, con etiquetas" },
    { id: "Como nuevo", title: "Como nuevo", desc: "Poco uso, sin defectos" },
    { id: "Bueno", title: "Bueno", desc: "Uso normal, buen estado" },
    { id: "Aceptable", title: "Aceptable", desc: "Marcas de uso visibles" }
  ];

  // Cargar fotos desde el equipo
  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages].slice(0, 5)); // Máximo 5 fotos
  }

  function handleRemoveImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Imagen por defecto si no suben fotos
    const mainImage = images[0] || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";

    const newProduct = {
      id: Date.now(),
      title: productName,
      description,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 1,
      category: selectedCategory,
      status: selectedStatus,
      image: mainImage,
      vendor: "Jessica Ayelén",
      location: "Orizaba-Córdoba · Facultad de Ingeniería",
      rating: "5.0",
      reviews: "1"
    };

    if (onCreateProduct) onCreateProduct(newProduct);
  }

  return (
    <div className="create-pub-container">
      <style>{css}</style>

      <button type="button" className="back-link" onClick={onBack}>
        ‹ Volver
      </button>

      <h1 className="pub-title">Nueva publicación</h1>

      <form onSubmit={handleSubmit}>
        {/* INPUT INVISIBLE DE ARCHIVOS */}
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        {/* FOTOS */}
        <label className="pub-section-label">Fotos</label>
        <div className="photos-grid">
          {/* FOTO PRINCIPAL */}
          <div className="photo-box-main" onClick={() => !images[0] && document.getElementById("fileInput").click()}>
            {images[0] ? (
              <>
                <img src={images[0]} alt="Principal" className="preview-img" />
                <button type="button" className="remove-img-btn" onClick={(e) => { e.stopPropagation(); handleRemoveImage(0); }}>✕</button>
              </>
            ) : (
              <>
                <span className="plus-icon">+</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Agregar foto principal</span>
              </>
            )}
          </div>

          {/* FOTOS SECUNDARIAS (4) */}
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="photo-box-sub" onClick={() => !images[idx] && document.getElementById("fileInput").click()}>
              {images[idx] ? (
                <>
                  <img src={images[idx]} alt={`Foto ${idx}`} className="preview-img" />
                  <button type="button" className="remove-img-btn" onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}>✕</button>
                </>
              ) : (
                <span className="plus-icon">+</span>
              )}
            </div>
          ))}
        </div>
        <p className="pub-subtext">Hasta 5 fotos. La primera será la imagen principal del producto.</p>

        {/* NOMBRE */}
        <label className="pub-section-label" htmlFor="pName">Nombre del producto *</label>
        <input
          id="pName"
          type="text"
          className="pub-input"
          placeholder="Ej. Cálculo James Stewart 8ª edición"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />

        {/* DESCRIPCIÓN */}
        <label className="pub-section-label" htmlFor="pDesc">Descripción *</label>
        <textarea
          id="pDesc"
          className="pub-textarea"
          placeholder="Describe el estado, características y cualquier detalle relevante..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* PRECIO Y EXISTENCIAS */}
        <div className="row-dual">
          <div>
            <label className="pub-section-label" htmlFor="pPrice">Precio (MXN) *</label>
            <input
              id="pPrice"
              type="number"
              className="pub-input"
              placeholder="\$ 0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>
          <div>
            <label className="pub-section-label" htmlFor="pStock">Existencias *</label>
            <input
              id="pStock"
              type="number"
              className="pub-input"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="1"
              required
            />
          </div>
        </div>

        {/* CATEGORÍA */}
        <label className="pub-section-label">Categoría *</label>
        <div className="categories-selector">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={`cat-btn ${selectedCategory === cat.label ? "selected" : ""}`}
              onClick={() => setSelectedCategory(cat.label)}
            >
              <span style={{ fontSize: "1.3rem", marginBottom: "4px" }}>{cat.icon}</span>
              <span style={{ fontSize: "0.82rem" }}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ESTADO DEL PRODUCTO */}
        <label className="pub-section-label">Estado del producto *</label>
        <div className="status-grid">
          {statusOptions.map((st) => (
            <button
              key={st.id}
              type="button"
              className={`status-card ${selectedStatus === st.id ? "selected" : ""}`}
              onClick={() => setSelectedStatus(st.id)}
            >
              <span className="status-title">{st.title}</span>
              <span className="status-desc">{st.desc}</span>
            </button>
          ))}
        </div>

        {/* ACCIONES */}
        <div className="pub-actions">
          <button type="button" className="btn-draft">
            Guardar borrador
          </button>
          <button type="submit" className="btn-publish-submit">
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
}