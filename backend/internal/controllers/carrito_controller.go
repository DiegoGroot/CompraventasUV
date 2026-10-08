package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AgregarCarritoReq struct {
	ProductoID string `json:"producto_id" binding:"required"`
	Cantidad   int    `json:"cantidad" binding:"required,min=1"`
}

// POST /api/v1/carrito
func AgregarAlCarrito(c *gin.Context) {
	var req AgregarCarritoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	usuarioIDStr := c.MustGet("userID").(string)
	usuarioID, _ := uuid.Parse(usuarioIDStr)

	// 1. Validar el producto y su stock
	var producto models.Producto
	if err := config.DB.First(&producto, "id = ?", req.ProductoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	if producto.VendedorID == usuarioID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes agregar tu propio producto al carrito"})
		return
	}

	if producto.Estado != "disponible" || producto.Stock < req.Cantidad {
		c.JSON(http.StatusConflict, gin.H{"error": "Stock insuficiente o producto no disponible"})
		return
	}

	// 2. Verificar si el producto ya está en el carrito
	var itemExistente models.CarritoItem
	if err := config.DB.Where("usuario_id = ? AND producto_id = ?", usuarioID, producto.ID).First(&itemExistente).Error; err == nil {
		// Si existe, actualizamos la cantidad sumando la nueva
		nuevaCantidad := itemExistente.Cantidad + req.Cantidad
		if nuevaCantidad > producto.Stock {
			c.JSON(http.StatusConflict, gin.H{"error": "La cantidad total en tu carrito excede el stock disponible"})
			return
		}
		itemExistente.Cantidad = nuevaCantidad
		config.DB.Save(&itemExistente)
		
		c.JSON(http.StatusOK, gin.H{"mensaje": "Cantidad actualizada en el carrito", "item": itemExistente})
		return
	}

	// 3. Si no existe, creamos el nuevo registro
	nuevoItem := models.CarritoItem{
		UsuarioID:  usuarioID,
		ProductoID: producto.ID,
		Cantidad:   req.Cantidad,
	}

	if err := config.DB.Create(&nuevoItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al agregar al carrito"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mensaje": "Producto agregado al carrito", "item": nuevoItem})
}

// GET /api/v1/carrito
func ObtenerCarrito(c *gin.Context) {
	usuarioIDStr := c.MustGet("userID").(string)

	var items []models.CarritoItem
	if err := config.DB.
		Where("usuario_id = ?", usuarioIDStr).
		Preload("Producto").
		Preload("Producto.Imagenes").
		Order("fecha_agregado ASC").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el carrito"})
		return
	}

	// Calcular total dinámicamente
	var total float64 = 0
	for _, item := range items {
		total += item.Producto.Precio * float64(item.Cantidad)
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"total": total,
	})
}
// DELETE /api/v1/carrito/:id
func EliminarDelCarrito(c *gin.Context) {
	itemID := c.Param("id") // ID del registro en carrito_items, no del producto
	usuarioIDStr := c.MustGet("userID").(string)

	// 1. Verificar que el artículo exista y pertenezca al usuario
	var item models.CarritoItem
	if err := config.DB.First(&item, "id = ? AND usuario_id = ?", itemID, usuarioIDStr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artículo no encontrado en tu carrito"})
		return
	}

	// 2. Eliminar el artículo
	if err := config.DB.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar el artículo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Artículo eliminado del carrito"})
}

// DELETE /api/v1/carrito
func VaciarCarrito(c *gin.Context) {
	usuarioIDStr := c.MustGet("userID").(string)

	// Eliminar todos los registros asociados al ID del usuario
	if err := config.DB.Where("usuario_id = ?", usuarioIDStr).Delete(&models.CarritoItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al vaciar el carrito"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Carrito vaciado correctamente"})
}
// POST /api/v1/carrito/checkout
func CheckoutCarrito(c *gin.Context) {
	usuarioIDStr := c.MustGet("userID").(string)
	usuarioID, _ := uuid.Parse(usuarioIDStr)

	// Iniciamos la transacción. Si algo falla, nada se guarda en la base de datos.
	tx := config.DB.Begin()

	// 1. Obtener todos los items del carrito del usuario
	var items []models.CarritoItem
	if err := tx.Where("usuario_id = ?", usuarioIDStr).Preload("Producto").Find(&items).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer el carrito"})
		return
	}

	if len(items) == 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "El carrito está vacío"})
		return
	}

	// 2. Agrupar los items por VendedorID
	// Esto asegura que si compras a 3 tiendas distintas, se creen 3 pedidos separados.
	pedidosPorVendedor := make(map[uuid.UUID][]models.CarritoItem)
	for _, item := range items {
		vendedorID := item.Producto.VendedorID
		pedidosPorVendedor[vendedorID] = append(pedidosPorVendedor[vendedorID], item)
	}

	// 3. Procesar cada grupo como un pedido independiente
	for vendedorID, articulos := range pedidosPorVendedor {
		var total float64 = 0

		// A. Validar stock en tiempo real directamente de la BD
		for _, item := range articulos {
			var productoBD models.Producto
			if err := tx.First(&productoBD, "id = ?", item.ProductoID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusNotFound, gin.H{"error": "El producto '" + item.Producto.Nombre + "' ya no existe"})
				return
			}

			if productoBD.Estado != "disponible" || productoBD.Stock < item.Cantidad {
				tx.Rollback()
				c.JSON(http.StatusConflict, gin.H{
					"error": "Stock insuficiente para el producto: " + productoBD.Nombre,
					"stock_disponible": productoBD.Stock,
				})
				return
			}
			// Sumar al total del pedido
			total += productoBD.Precio * float64(item.Cantidad)
		}

		// B. Crear el Pedido Maestro
		// Tomamos el TiendaID del primer producto del grupo
		tiendaID := articulos[0].Producto.TiendaID 

		nuevoPedido := models.Pedido{
			CompradorID:     usuarioID,
			VendedorID:      vendedorID,
			TiendaID:        tiendaID,
			Total:           total,
			Estado:          "pendiente",
			EsCompraDirecta: false,
		}

		if err := tx.Create(&nuevoPedido).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar el pedido de la tienda"})
			return
		}

		// C. Crear los detalles y descontar el inventario
		for _, item := range articulos {
			detalle := models.DetallePedido{
				PedidoID:       nuevoPedido.ID,
				ProductoID:     item.ProductoID,
				Cantidad:       item.Cantidad,
				PrecioUnitario: item.Producto.Precio,
			}
			if err := tx.Create(&detalle).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el detalle del pedido"})
				return
			}

			// Descontar stock
			var producto models.Producto
			tx.First(&producto, "id = ?", item.ProductoID)
			producto.Stock -= item.Cantidad
			if producto.Stock == 0 {
				producto.Estado = "agotado"
			}
			tx.Save(&producto)
		}
	}

	// 4. Vaciar el carrito tras el éxito de las ventas
	if err := tx.Where("usuario_id = ?", usuarioIDStr).Delete(&models.CarritoItem{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al limpiar tu carrito"})
		return
	}

	// 5. Confirmar transacción
	tx.Commit()

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "¡Checkout exitoso! Se han generado tus pedidos.",
	})
}