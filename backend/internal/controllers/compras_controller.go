package controllers

import (
	"errors"
	"net/http"
	"time"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CrearCompraReq struct {
	ProductoID string `json:"producto_id" binding:"required"`
	Cantidad   int    `json:"cantidad"`
}

// POST /api/v1/compras
func CrearCompra(c *gin.Context) {
	var req CrearCompraReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	productoID, err := uuid.Parse(req.ProductoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Producto no válido"})
		return
	}
	compradorID, _ := uuid.Parse(c.MustGet("userID").(string))
	cantidad := req.Cantidad
	if cantidad <= 0 {
		cantidad = 1
	}

	var compra models.Compra
	errTx := config.DB.Transaction(func(tx *gorm.DB) error {
		var p models.Producto
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&p, "id = ?", productoID).Error; err != nil {
			return errors.New("Producto no encontrado")
		}
		if p.VendedorID == compradorID {
			return errors.New("No puedes comprar tu propio producto")
		}
		if p.Estado != "disponible" || p.Stock < cantidad {
			return errors.New("Producto no disponible o sin existencias suficientes")
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

		compra = models.Compra{
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
	})
	if errTx != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errTx.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"mensaje": "Compra registrada", "compra": compra})
}

type CompraVista struct {
	ID             uuid.UUID `json:"id"`
	NombreProducto string    `json:"nombre_producto"`
	Cantidad       int       `json:"cantidad"`
	PrecioUnitario float64   `json:"precio_unitario"`
	Estado         string    `json:"estado"`
	FechaCompra    time.Time `json:"fecha_compra"`
	Contraparte    string    `json:"contraparte"`
	ContraparteID  uuid.UUID `json:"contraparte_id"`
	Imagen         *string   `json:"imagen"`
}

// propia/otra son constantes internas (nunca vienen del cliente)
func listarCompras(c *gin.Context, propia, otra string) {
	userID := c.MustGet("userID").(string)
	out := []CompraVista{}
	err := config.DB.Raw(`
		SELECT c.id, c.nombre_producto, c.cantidad, c.precio_unitario, c.estado, c.fecha_compra,
		       u.username AS contraparte, u.id AS contraparte_id,
		       (SELECT i.url_imagen FROM imagenes_producto i
		         WHERE i.producto_id = c.producto_id
		         ORDER BY i.es_principal DESC LIMIT 1) AS imagen
		FROM compras c
		JOIN usuarios u ON u.id = c.`+otra+`
		WHERE c.`+propia+` = ?
		ORDER BY c.fecha_compra DESC`, userID).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar los pedidos"})
		return
	}
	c.JSON(http.StatusOK, out)
}

// GET /api/v1/mis-compras
func ObtenerMisCompras(c *gin.Context) { listarCompras(c, "comprador_id", "vendedor_id") }

// GET /api/v1/mis-ventas
func ObtenerMisVentas(c *gin.Context) { listarCompras(c, "vendedor_id", "comprador_id") }

type EstadoCompraReq struct {
	Estado string `json:"estado" binding:"required"`
}

// PATCH /api/v1/compras/:id/estado (solo el vendedor)
func ActualizarEstadoCompra(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var req EstadoCompraReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado requerido"})
		return
	}
	switch req.Estado {
	case "en_camino", "entregado", "cancelado":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado no válido"})
		return
	}
	res := config.DB.Model(&models.Compra{}).
		Where("id = ? AND vendedor_id = ?", c.Param("id"), userID).
		Update("estado", req.Estado)
	if res.Error != nil || res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "Estado actualizado", "estado": req.Estado})
}