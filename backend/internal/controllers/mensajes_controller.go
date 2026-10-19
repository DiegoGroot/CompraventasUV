package controllers

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EnviarMensajeReq struct {
	ParaID     string  `json:"para_id" binding:"required"`
	ProductoID *string `json:"producto_id"`
	Contenido  string  `json:"contenido" binding:"required"`
}

// POST /api/v1/mensajes
func EnviarMensaje(c *gin.Context) {
	var req EnviarMensajeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	contenido := strings.TrimSpace(req.Contenido)
	if contenido == "" || len(contenido) > 1000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El mensaje debe tener entre 1 y 1000 caracteres"})
		return
	}
	paraID, err := uuid.Parse(req.ParaID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Destinatario no válido"})
		return
	}
	deID, _ := uuid.Parse(c.MustGet("userID").(string))
	if deID == paraID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes enviarte mensajes a ti mismo"})
		return
	}

	var existe int64
	config.DB.Model(&models.Usuario{}).Where("id = ?", paraID).Count(&existe)
	if existe == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	msg := models.Mensaje{DeID: deID, ParaID: paraID, Contenido: contenido}
	if req.ProductoID != nil && *req.ProductoID != "" {
		if pid, err := uuid.Parse(*req.ProductoID); err == nil {
			msg.ProductoID = &pid
		}
	}
	if err := config.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo enviar el mensaje"})
		return
	}
	c.JSON(http.StatusCreated, msg)
}

type Conversacion struct {
	UsuarioID uuid.UUID `json:"usuario_id"`
	Usuario   string    `json:"usuario"`
	Ultimo    string    `json:"ultimo"`
	Fecha     time.Time `json:"fecha"`
	NoLeidos  int       `json:"no_leidos"`
}

// GET /api/v1/conversaciones
func ObtenerConversaciones(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	out := []Conversacion{}
	err := config.DB.Raw(`
		SELECT * FROM (
		  SELECT DISTINCT ON (m.otro_id)
		         m.otro_id AS usuario_id, us.username AS usuario,
		         m.contenido AS ultimo, m.fecha,
		         (SELECT COUNT(*) FROM mensajes x
		           WHERE x.de_id = m.otro_id AND x.para_id = @u AND NOT x.leido) AS no_leidos
		  FROM (
		    SELECT CASE WHEN de_id = @u THEN para_id ELSE de_id END AS otro_id,
		           contenido, fecha
		    FROM mensajes WHERE de_id = @u OR para_id = @u
		  ) m
		  JOIN usuarios us ON us.id = m.otro_id
		  ORDER BY m.otro_id, m.fecha DESC
		) t ORDER BY fecha DESC`, sql.Named("u", userID)).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar las conversaciones"})
		return
	}
	c.JSON(http.StatusOK, out)
}

// GET /api/v1/mensajes/:usuarioID (hilo con otro usuario; marca como leídos)
func ObtenerMensajes(c *gin.Context) {
	yo := c.MustGet("userID").(string)
	otro, err := uuid.Parse(c.Param("usuarioID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuario no válido"})
		return
	}

	mensajes := []models.Mensaje{}
	config.DB.
		Where("(de_id = ? AND para_id = ?) OR (de_id = ? AND para_id = ?)", yo, otro, otro, yo).
		Order("fecha ASC").Find(&mensajes)

	config.DB.Model(&models.Mensaje{}).
		Where("de_id = ? AND para_id = ? AND leido = false", otro, yo).
		Update("leido", true)

	c.JSON(http.StatusOK, mensajes)
}