package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CrearTiendaReq struct {
	CategoriaPrincipalID uint    `json:"categoria_principal_id" binding:"required"`
	RegionID             uint    `json:"region_id" binding:"required"`
	FacultadID           uint    `json:"facultad_id" binding:"required"`
	Nombre               string  `json:"nombre" binding:"required"`
	Descripcion          string  `json:"descripcion"`
	ImagenLink           *string `json:"imagen_link"` // Puntero porque es opcional
}

func CrearTienda(c *gin.Context) {
	var req CrearTiendaReq

	// 1. Validar el JSON entrante
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos incompletos o formato inválido"})
		return
	}

	// 2. Extraer el ID del usuario del token JWT (inyectado por el middleware)
	userIDStr := c.MustGet("userID").(string)
	vendedorID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	// 3. Construir el modelo
	nuevaTienda := models.Tienda{
		VendedorID:           vendedorID, // Se asigna automáticamente al dueño del token
		CategoriaPrincipalID: req.CategoriaPrincipalID,
		RegionID:             req.RegionID,
		FacultadID:           req.FacultadID,
		Nombre:               req.Nombre,
		Descripcion:          req.Descripcion,
		ImagenLink:           req.ImagenLink,
	}

	// 4. Guardar en PostgreSQL
	if err := config.DB.Create(&nuevaTienda).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la tienda"})
		return
	}

	// 5. Devolver la respuesta exitosa
	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Tienda creada exitosamente",
		"tienda":  nuevaTienda,
	})
}
// GET /api/v1/mis-tiendas
func ObtenerMisTiendas(c *gin.Context) {
	userIDStr := c.MustGet("userID").(string)

	var tiendas []models.Tienda
	if err := config.DB.Where("vendedor_id = ?", userIDStr).Find(&tiendas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las tiendas"})
		return
	}

	c.JSON(http.StatusOK, tiendas)
}

// PUT /api/v1/tiendas/:id
func ActualizarTienda(c *gin.Context) {
	tiendaID := c.Param("id")
	userIDStr := c.MustGet("userID").(string)

	// 1. Buscar la tienda
	var tienda models.Tienda
	if err := config.DB.First(&tienda, "id = ?", tiendaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tienda no encontrada"})
		return
	}

	// 2. Verificar propiedad (Solo el dueño puede editar)
	if tienda.VendedorID.String() != userIDStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para editar esta tienda"})
		return
	}

	// 3. Bind de los nuevos datos
	var req CrearTiendaReq // Reutilizamos el struct de creación
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// 4. Actualizar
	tienda.Nombre = req.Nombre
	tienda.Descripcion = req.Descripcion
	tienda.CategoriaPrincipalID = req.CategoriaPrincipalID
	tienda.RegionID = req.RegionID
	tienda.FacultadID = req.FacultadID
	tienda.ImagenLink = req.ImagenLink

	config.DB.Save(&tienda)
	c.JSON(http.StatusOK, gin.H{"mensaje": "Tienda actualizada", "tienda": tienda})
}

// DELETE /api/v1/tiendas/:id
func EliminarTienda(c *gin.Context) {
	tiendaID := c.Param("id")
	userIDStr := c.MustGet("userID").(string)

	var tienda models.Tienda
	if err := config.DB.First(&tienda, "id = ?", tiendaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tienda no encontrada"})
		return
	}

	if tienda.VendedorID.String() != userIDStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para eliminar esta tienda"})
		return
	}

	// Al eliminar, PostgreSQL hará CASCADE y borrará los productos de esta tienda
	config.DB.Delete(&tienda)
	c.JSON(http.StatusOK, gin.H{"mensaje": "Tienda eliminada correctamente"})
}