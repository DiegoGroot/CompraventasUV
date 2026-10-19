package controllers

import (
	"net/http"

	"compraventasb/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AsignarTiendaReq struct {
	TiendaID *string `json:"tienda_id"`
}

// PATCH /api/v1/productos/:id/tienda  (tienda_id vacío o null = sin puesto)
func AsignarProductoTienda(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	productoID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Publicación no válida"})
		return
	}

	var req AsignarTiendaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var tienda interface{}
	if req.TiendaID != nil && *req.TiendaID != "" {
		tid, err := uuid.Parse(*req.TiendaID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Puesto no válido"})
			return
		}
		var n int64
		config.DB.Raw(`SELECT COUNT(*) FROM tiendas WHERE id = ? AND vendedor_id = ?`, tid, userID).Scan(&n)
		if n == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Puesto no encontrado"})
			return
		}
		tienda = tid
	}

	res := config.DB.Exec(`UPDATE productos SET tienda_id = ? WHERE id = ? AND vendedor_id = ?`, tienda, productoID, userID)
	if res.Error != nil || res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Publicación no encontrada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "Puesto actualizado"})
}