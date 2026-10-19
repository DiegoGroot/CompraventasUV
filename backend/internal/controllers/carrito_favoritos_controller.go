package controllers

import (
	"errors"
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ProductoVista struct {
	ID         uuid.UUID `json:"id"`
	Nombre     string    `json:"nombre"`
	Precio     float64   `json:"precio"`
	Stock      int       `json:"stock"`
	Estado     string    `json:"estado"`
	VendedorID uuid.UUID `json:"vendedor_id"`
	Vendedor   string    `json:"vendedor"`
	Imagen     *string   `json:"imagen"`
	Cantidad   int       `json:"cantidad"`
}

type itemCarrito struct {
	ProductoID uuid.UUID `gorm:"column:producto_id"`
	Cantidad   int       `gorm:"column:cantidad"`
}

type CarritoReq struct {
	ProductoID string `json:"producto_id" binding:"required"`
	Cantidad   int    `json:"cantidad"`
}

type CantidadReq struct {
	Cantidad int `json:"cantidad" binding:"required"`
}

const imagenPrincipalSQL = `(SELECT i.url_imagen FROM imagenes_producto i
	WHERE i.producto_id = p.id ORDER BY i.es_principal DESC LIMIT 1) AS imagen`

// ---------- Carrito ----------

// GET /api/v1/carrito
func ObtenerCarrito(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	out := []ProductoVista{}
	err := config.DB.Raw(`
		SELECT p.id, p.nombre, p.precio, p.stock, p.estado::text AS estado,
		       p.vendedor_id, u.username AS vendedor, k.cantidad, `+imagenPrincipalSQL+`
		FROM carritos k
		JOIN productos p ON p.id = k.producto_id
		JOIN usuarios u ON u.id = p.vendedor_id
		WHERE k.usuario_id = ?
		ORDER BY k.fecha_agregado DESC`, userID).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo cargar el carrito"})
		return
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/v1/carrito
func AgregarCarrito(c *gin.Context) {
	var req CarritoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	productoID, err := uuid.Parse(req.ProductoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no válido"})
		return
	}
	userID, _ := uuid.Parse(c.MustGet("userID").(string))
	cantidad := req.Cantidad
	if cantidad < 1 {
		cantidad = 1
	}

	var p struct {
		VendedorID uuid.UUID `gorm:"column:vendedor_id"`
		Stock      int       `gorm:"column:stock"`
		Estado     string    `gorm:"column:estado"`
	}
	res := config.DB.Raw(`SELECT vendedor_id, stock, estado::text AS estado FROM productos WHERE id = ?`, productoID).Scan(&p)
	if res.Error != nil || res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}
	if p.VendedorID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes agregar tu propio producto"})
		return
	}
	if p.Estado != "disponible" || p.Stock < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no disponible"})
		return
	}
	if cantidad > p.Stock {
		cantidad = p.Stock
	}

	err = config.DB.Exec(`
		INSERT INTO carritos (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)
		ON CONFLICT (usuario_id, producto_id)
		DO UPDATE SET cantidad = LEAST(carritos.cantidad + EXCLUDED.cantidad, ?)`,
		userID, productoID, cantidad, p.Stock).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo agregar al carrito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "Agregado al carrito"})
}

// PATCH /api/v1/carrito/:productoID
func ActualizarCarrito(c *gin.Context) {
	var req CantidadReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Cantidad < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cantidad no válida"})
		return
	}
	productoID, err := uuid.Parse(c.Param("productoID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no válido"})
		return
	}
	userID := c.MustGet("userID").(string)
	res := config.DB.Exec(`
		UPDATE carritos
		SET cantidad = GREATEST(1, LEAST(?, (SELECT stock FROM productos WHERE id = ?)))
		WHERE usuario_id = ? AND producto_id = ?`,
		req.Cantidad, productoID, userID, productoID)
	if res.Error != nil || res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No está en tu carrito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "Cantidad actualizada"})
}

// DELETE /api/v1/carrito/:productoID
func QuitarCarrito(c *gin.Context) {
	productoID, err := uuid.Parse(c.Param("productoID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no válido"})
		return
	}
	userID := c.MustGet("userID").(string)
	if err := config.DB.Exec(`DELETE FROM carritos WHERE usuario_id = ? AND producto_id = ?`, userID, productoID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo quitar del carrito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "Quitado del carrito"})
}

// registrarCompra descuenta inventario y crea la compra dentro de una transacción.
func registrarCompra(tx *gorm.DB, compradorID, productoID uuid.UUID, cantidad int) error {
	var p models.Producto
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&p, "id = ?", productoID).Error; err != nil {
		return errors.New("Un producto del carrito ya no existe")
	}
	if p.VendedorID == compradorID {
		return errors.New("No puedes comprar tu propio producto")
	}
	if p.Estado != "disponible" || p.Stock < cantidad {
		return errors.New("Sin existencias suficientes de: " + p.Nombre)
	}

	nuevoStock := p.Stock - cantidad
	nuevoEstado := "disponible"
	if nuevoStock == 0 {
		nuevoEstado = "vendido"
	}
	if err := tx.Model(&models.Producto{}).Where("id = ?", p.ID).
		Updates(map[string]interface{}{"stock": nuevoStock, "estado": nuevoEstado}).Error; err != nil {
		return errors.New("No se pudo actualizar el inventario")
	}

	compra := models.Compra{
		CompradorID:    compradorID,
		VendedorID:     p.VendedorID,
		ProductoID:     &p.ID,
		NombreProducto: p.Nombre,
		Cantidad:       cantidad,
		PrecioUnitario: p.Precio,
		Estado:         "pendiente",
	}
	if err := tx.Create(&compra).Error; err != nil {
		return errors.New("No se pudo registrar la compra")
	}
	return nil
}

// POST /api/v1/carrito/comprar
func ComprarCarrito(c *gin.Context) {
	compradorID, _ := uuid.Parse(c.MustGet("userID").(string))
	total := 0

	errTx := config.DB.Transaction(func(tx *gorm.DB) error {
		var items []itemCarrito
		if err := tx.Raw(`SELECT producto_id, cantidad FROM carritos WHERE usuario_id = ? ORDER BY fecha_agregado`, compradorID).Scan(&items).Error; err != nil {
			return errors.New("No se pudo leer el carrito")
		}
		if len(items) == 0 {
			return errors.New("Tu carrito está vacío")
		}
		for _, it := range items {
			if err := registrarCompra(tx, compradorID, it.ProductoID, it.Cantidad); err != nil {
				return err
			}
		}
		total = len(items)
		if err := tx.Exec(`DELETE FROM carritos WHERE usuario_id = ?`, compradorID).Error; err != nil {
			return errors.New("No se pudo vaciar el carrito")
		}
		return nil
	})
	if errTx != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errTx.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"mensaje": "Compra realizada", "compras": total})
}

// ---------- Favoritos ----------

// GET /api/v1/favoritos
func ObtenerFavoritos(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	out := []ProductoVista{}
	err := config.DB.Raw(`
		SELECT p.id, p.nombre, p.precio, p.stock, p.estado::text AS estado,
		       p.vendedor_id, u.username AS vendedor, 0 AS cantidad, `+imagenPrincipalSQL+`
		FROM favoritos f
		JOIN productos p ON p.id = f.producto_id
		JOIN usuarios u ON u.id = p.vendedor_id
		WHERE f.usuario_id = ?
		ORDER BY f.fecha_agregado DESC`, userID).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar los favoritos"})
		return
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/v1/favoritos/:productoID (alterna: agrega o quita)
func AlternarFavorito(c *gin.Context) {
	productoID, err := uuid.Parse(c.Param("productoID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no válido"})
		return
	}
	userID := c.MustGet("userID").(string)

	res := config.DB.Exec(`DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?`, userID, productoID)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo actualizar favoritos"})
		return
	}
	if res.RowsAffected > 0 {
		c.JSON(http.StatusOK, gin.H{"favorito": false})
		return
	}

	var n int64
	config.DB.Raw(`SELECT COUNT(*) FROM productos WHERE id = ?`, productoID).Scan(&n)
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}
	if err := config.DB.Exec(`INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?) ON CONFLICT DO NOTHING`, userID, productoID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo guardar el favorito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"favorito": true})
}