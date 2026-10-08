package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CompraDirectaReq struct {
	ProductoID string `json:"producto_id" binding:"required"`
	Cantidad   int    `json:"cantidad" binding:"required,min=1"`
}

// POST /api/v1/pedidos/directo
func RealizarCompraDirecta(c *gin.Context) {
	var req CompraDirectaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	compradorIDStr := c.MustGet("userID").(string)
	compradorID, _ := uuid.Parse(compradorIDStr)

	// Iniciar Transacción
	tx := config.DB.Begin()

	// 1. Buscar el producto para verificar stock y precio
	var producto models.Producto
	if err := tx.First(&producto, "id = ?", req.ProductoID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	// 2. Validaciones de negocio
	if producto.VendedorID == compradorID {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes comprar tu propio producto"})
		return
	}
	if producto.Stock < req.Cantidad {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "Stock insuficiente", "stock_disponible": producto.Stock})
		return
	}
	if producto.Estado != "disponible" {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "El producto ya no está disponible"})
		return
	}

	// 3. Calcular Total
	totalPedido := producto.Precio * float64(req.Cantidad)

	// 4. Crear el Pedido Maestro
	nuevoPedido := models.Pedido{
		CompradorID:     compradorID,
		VendedorID:      producto.VendedorID,
		TiendaID:        producto.TiendaID,
		Total:           totalPedido,
		Estado:          "pendiente",
		EsCompraDirecta: true,
	}

	if err := tx.Create(&nuevoPedido).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar el pedido"})
		return
	}

	// 5. Crear el Detalle del Pedido
	detalle := models.DetallePedido{
		PedidoID:       nuevoPedido.ID,
		ProductoID:     producto.ID,
		Cantidad:       req.Cantidad,
		PrecioUnitario: producto.Precio, // Congelamos el precio
	}

	if err := tx.Create(&detalle).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el detalle del pedido"})
		return
	}

	// 6. Restar el inventario (Stock)
	producto.Stock -= req.Cantidad
	if producto.Stock == 0 {
		producto.Estado = "agotado" // Si se acaban, cambiamos el estado automáticamente
	}

	if err := tx.Save(&producto).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el inventario"})
		return
	}

	// Confirmar transacción
	tx.Commit()

	// Cargar detalles para enviarlos en la respuesta
	config.DB.Preload("Detalles").First(&nuevoPedido, "id = ?", nuevoPedido.ID)

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Compra realizada exitosamente",
		"pedido":  nuevoPedido,
	})
}
// GET /api/v1/mis-compras
func ObtenerMisCompras(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)

	var compras []models.Pedido
	// Buscamos donde el usuario sea el COMPRADOR
	if err := config.DB.
		Where("comprador_id = ?", userIDStr).
		Preload("Detalles").
		Preload("Detalles.Producto").
		Preload("Detalles.Producto.Imagenes").
		Order("fecha_pedido DESC"). // Los más recientes primero
		Find(&compras).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el historial de compras"})
		return
	}

	c.JSON(http.StatusOK, compras)
}

// GET /api/v1/mis-ventas
func ObtenerMisVentas(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)

	var ventas []models.Pedido
	// Buscamos donde el usuario sea el VENDEDOR
	if err := config.DB.
		Where("vendedor_id = ?", userIDStr).
		Preload("Detalles").
		Preload("Detalles.Producto").
		Preload("Detalles.Producto.Imagenes").
		Order("fecha_pedido DESC").
		Find(&ventas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el historial de ventas"})
		return
	}

	c.JSON(http.StatusOK, ventas)
}
type ActualizarEstadoPedidoReq struct {
	Estado string `json:"estado" binding:"required,oneof=pendiente confirmado cancelado"`
}

// PATCH /api/v1/mis-ventas/:id/estado
func ActualizarEstadoPedido(c *gin.Context) {
	pedidoID := c.Param("id")
	userIDStr := c.MustGet("userID").(string)

	var req ActualizarEstadoPedidoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado inválido. Solo se permite: pendiente, confirmado o cancelado"})
		return
	}

	// Iniciamos transacción por si necesitamos devolver el stock
	tx := config.DB.Begin()

	var pedido models.Pedido
	// Cargamos el pedido y sus detalles para saber qué productos afectar si se cancela
	if err := tx.Preload("Detalles").First(&pedido, "id = ?", pedidoID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	// Seguridad: Verificar que el usuario que hace la petición sea el vendedor
	if pedido.VendedorID.String() != userIDStr {
		tx.Rollback()
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para actualizar esta venta"})
		return
	}

	// Si el estado ya es el que solicitan, no hacemos nada
	if pedido.Estado == req.Estado {
		tx.Rollback()
		c.JSON(http.StatusOK, gin.H{"mensaje": "El pedido ya tiene ese estado", "pedido": pedido})
		return
	}

	// Regla de Negocio: No se puede revivir un pedido cancelado (para evitar conflictos de inventario)
	if pedido.Estado == "cancelado" {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Un pedido cancelado no puede volver a abrirse"})
		return
	}

	// Regla de Negocio: Si se cancela el pedido, devolvemos el stock
	if req.Estado == "cancelado" {
		for _, detalle := range pedido.Detalles {
			var producto models.Producto
			if err := tx.First(&producto, "id = ?", detalle.ProductoID).Error; err == nil {
				producto.Stock += detalle.Cantidad
				
				// Si estaba agotado, lo volvemos a poner disponible
				if producto.Estado == "agotado" && producto.Stock > 0 {
					producto.Estado = "disponible"
				}
				
				tx.Save(&producto)
			}
		}
	}

	// Actualizar el estado del pedido
	pedido.Estado = req.Estado
	if err := tx.Save(&pedido).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el estado del pedido"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "Estado de la venta actualizado correctamente",
		"pedido":  pedido,
	})
}