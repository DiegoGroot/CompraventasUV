package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AgregarFavoritoReq struct {
	ProductoID string `json:"producto_id" binding:"required"`
}

// POST /api/v1/favoritos
func AgregarFavorito(c *gin.Context) {
	var req AgregarFavoritoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de producto requerido"})
		return
	}

	usuarioIDStr := c.MustGet("userID").(string)
	usuarioID, _ := uuid.Parse(usuarioIDStr)
	productoID, err := uuid.Parse(req.ProductoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de producto inválido"})
		return
	}

	// 1. Validar que el producto exista
	var producto models.Producto
	if err := config.DB.First(&producto, "id = ?", productoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "El producto no existe"})
		return
	}

	// 2. Comprobar si ya está en favoritos
	var favExistente models.Favorito
	if err := config.DB.Where("usuario_id = ? AND producto_id = ?", usuarioID, productoID).First(&favExistente).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"mensaje": "El producto ya está en tus favoritos"})
		return
	}

	// 3. Agregar a favoritos
	nuevoFavorito := models.Favorito{
		UsuarioID:  usuarioID,
		ProductoID: productoID,
	}

	if err := config.DB.Create(&nuevoFavorito).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar en favoritos"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mensaje": "Añadido a favoritos", "favorito": nuevoFavorito})
}

// GET /api/v1/favoritos
func ObtenerFavoritos(c *gin.Context) {
	usuarioIDStr := c.MustGet("userID").(string)

	var favoritos []models.Favorito
	if err := config.DB.
		Where("usuario_id = ?", usuarioIDStr).
		Preload("Producto").
		Preload("Producto.Imagenes").
		Order("fecha_agregado DESC").
		Find(&favoritos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener favoritos"})
		return
	}

	c.JSON(http.StatusOK, favoritos)
}

// DELETE /api/v1/favoritos/:producto_id
func EliminarFavorito(c *gin.Context) {
	productoID := c.Param("producto_id")
	usuarioIDStr := c.MustGet("userID").(string)

	// Eliminar el registro donde coincidan el usuario y el producto
	resultado := config.DB.Where("usuario_id = ? AND producto_id = ?", usuarioIDStr, productoID).Delete(&models.Favorito{})

	if resultado.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar de favoritos"})
		return
	}

	if resultado.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "El producto no estaba en tus favoritos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Eliminado de favoritos correctamente"})
}