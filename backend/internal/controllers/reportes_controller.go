package controllers

import (
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"compraventasb/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var motivosReporte = map[string]bool{
	"imagen_inapropiada":   true,
	"producto_prohibido":   true,
	"informacion_falsa":    true,
	"posible_fraude":       true,
	"publicacion_enganosa": true,
	"producto_defectuoso":  true,
	"conducta_inapropiada": true,
	"otro":                 true,
}

type CrearReporteReq struct {
	ProductoID  string `json:"producto_id"`
	Username    string `json:"username"`
	Motivo      string `json:"motivo" binding:"required"`
	Descripcion string `json:"descripcion"`
}

type idRow struct {
	ID uuid.UUID `gorm:"column:id"`
}

// POST /api/v1/reportes (de una publicación o de un usuario por username)
func CrearReporte(c *gin.Context) {
	var req CrearReporteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	if !motivosReporte[req.Motivo] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Motivo no válido"})
		return
	}
	descripcion := strings.TrimSpace(req.Descripcion)
	if utf8.RuneCountInString(descripcion) > 1000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La descripción no puede pasar de 1000 caracteres"})
		return
	}
	if req.Motivo == "otro" && descripcion == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Describe el motivo del reporte"})
		return
	}

	reportanteID, _ := uuid.Parse(c.MustGet("userID").(string))

	var reportado idRow
	var productoID interface{}

	if strings.TrimSpace(req.ProductoID) != "" {
		pid, err := uuid.Parse(strings.TrimSpace(req.ProductoID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Publicación no válida"})
			return
		}
		res := config.DB.Raw(`SELECT vendedor_id AS id FROM productos WHERE id = ?`, pid).Scan(&reportado)
		_ = res
	} else if nombre := strings.TrimSpace(req.Username); nombre != "" {
		res := config.DB.Raw(`SELECT id FROM usuarios WHERE lower(username) = lower(?)`, nombre).Scan(&reportado)
		if res.Error != nil || res.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Indica la publicación o el usuario a reportar"})
		return
	}

	if reportado.ID == reportanteID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes reportarte a ti mismo"})
		return
	}

	var desc interface{}
	if descripcion != "" {
		desc = descripcion
	}

	err := config.DB.Exec(`
		INSERT INTO reportes (reportante_id, vendedor_id, producto_id, motivo, descripcion)
		VALUES (?, ?, ?, ?, ?)`,
		reportanteID, reportado.ID, productoID, req.Motivo, desc).Error
	if err != nil {
		if strings.Contains(err.Error(), "idx_reportes_unico") {
			c.JSON(http.StatusConflict, gin.H{"error": "Ya tienes un reporte abierto sobre esto"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo enviar el reporte"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"mensaje": "Reporte enviado"})
}

type ReporteVista struct {
	ID            uuid.UUID  `json:"id"`
	Motivo        string     `json:"motivo"`
	Descripcion   *string    `json:"descripcion"`
	Estado        string     `json:"estado"`
	Respuesta     *string    `json:"respuesta"`
	FechaCreacion time.Time  `json:"fecha_creacion"`
	ProductoID    *uuid.UUID `json:"producto_id"`
	Producto      *string    `json:"producto"`
	Reportado     string     `json:"reportado"`
}

// GET /api/v1/mis-reportes
func ObtenerMisReportes(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	out := []ReporteVista{}
	err := config.DB.Raw(`
		SELECT r.id, r.motivo, r.descripcion, r.estado, r.respuesta_admin AS respuesta,
		       r.fecha_creacion, r.producto_id, p.nombre AS producto, u.username AS reportado
		FROM reportes r
		JOIN usuarios u ON u.id = r.vendedor_id
		LEFT JOIN productos p ON p.id = r.producto_id
		WHERE r.reportante_id = ?
		ORDER BY r.fecha_creacion DESC`, userID).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar tus reportes"})
		return
	}
	c.JSON(http.StatusOK, out)
}