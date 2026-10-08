package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EnviarMensajeReq struct {
	ReceptorID string `json:"receptor_id" binding:"required"`
	ProductoID string `json:"producto_id" binding:"required"`
	Contenido  string `json:"contenido" binding:"required"`
}

// POST /api/v1/mensajes
func EnviarMensaje(c *gin.Context) {
	var req EnviarMensajeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos incompletos"})
		return
	}

	remitenteIDStr := c.MustGet("userID").(string)
	remitenteID, _ := uuid.Parse(remitenteIDStr)
	receptorID, err := uuid.Parse(req.ReceptorID)
	
	if err != nil || remitenteID == receptorID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Receptor inválido o no puedes enviarte mensajes a ti mismo"})
		return
	}

	productoID, err := uuid.Parse(req.ProductoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de producto inválido"})
		return
	}

	nuevoMensaje := models.Mensaje{
		RemitenteID: remitenteID,
		ReceptorID:  receptorID,
		ProductoID:  productoID,
		Contenido:   req.Contenido,
	}

	if err := config.DB.Create(&nuevoMensaje).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al enviar el mensaje"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Mensaje enviado",
		"data":    nuevoMensaje,
	})
}

// GET /api/v1/mensajes/:receptor_id/:producto_id
func ObtenerHistorialChat(c *gin.Context) {
	miIDStr := c.MustGet("userID").(string)
	otroUsuarioID := c.Param("receptor_id")
	productoID := c.Param("producto_id")

	var mensajes []models.Mensaje

	// Buscar todos los mensajes donde los participantes seamos yo y el otro usuario, sobre ese producto
	if err := config.DB.
		Where("producto_id = ? AND ((remitente_id = ? AND receptor_id = ?) OR (remitente_id = ? AND receptor_id = ?))",
			productoID, miIDStr, otroUsuarioID, otroUsuarioID, miIDStr).
		Order("fecha_envio ASC"). // Orden cronológico para dibujar el chat
		Find(&mensajes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el historial"})
		return
	}

	// Opcional: Marcar los mensajes recibidos como leídos
	config.DB.Model(&models.Mensaje{}).
		Where("producto_id = ? AND remitente_id = ? AND receptor_id = ? AND leido = false", productoID, otroUsuarioID, miIDStr).
		Update("leido", true)

	c.JSON(http.StatusOK, mensajes)
}
// GET /api/v1/mensajes/inbox
func ObtenerBandejaEntrada(c *gin.Context) {
	miIDStr := c.MustGet("userID").(string)

	var todosLosMensajes []models.Mensaje

	// 1. Traer TODOS mis mensajes (enviados o recibidos) ordenados del más nuevo al más viejo
	if err := config.DB.
		Where("remitente_id = ? OR receptor_id = ?", miIDStr, miIDStr).
		Preload("Remitente").
		Preload("Receptor").
		Preload("Producto").
		Preload("Producto.Imagenes"). // Traemos la foto del producto para la miniatura
		Order("fecha_envio DESC").
		Find(&todosLosMensajes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al cargar la bandeja de entrada"})
		return
	}

	// 2. Usar un mapa para filtrar solo el último mensaje de cada chat único
	chatsActivos := make(map[string]models.Mensaje)
	var inbox []models.Mensaje

	for _, msg := range todosLosMensajes {
		var otroUsuarioID string
		
		// Determinar quién es la "otra persona" en este mensaje
		if msg.RemitenteID.String() == miIDStr {
			otroUsuarioID = msg.ReceptorID.String()
		} else {
			otroUsuarioID = msg.RemitenteID.String()
		}

		// La clave del diccionario será: "OtroUsuario_Producto"
		claveChat := otroUsuarioID + "_" + msg.ProductoID.String()

		// Como la lista está ordenada por fecha descendente, la primera vez 
		// que vemos esta clave garantizamos que es el mensaje más reciente.
		if _, existe := chatsActivos[claveChat]; !existe {
			chatsActivos[claveChat] = msg
			inbox = append(inbox, msg)
		}
	}

	c.JSON(http.StatusOK, inbox)
}