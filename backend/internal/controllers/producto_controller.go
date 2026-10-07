package controllers

import (
	"net/http"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CrearProductoReq struct {
	TiendaID    *string  `json:"tienda_id"`
	CategoriaID uint     `json:"categoria_id" binding:"required"`
	RegionID    uint     `json:"region_id" binding:"required"`
	FacultadID  uint     `json:"facultad_id" binding:"required"`
	Nombre      string   `json:"nombre" binding:"required"`
	Descripcion string   `json:"descripcion"`
	Precio      float64  `json:"precio" binding:"required"`
	Stock       int      `json:"stock"`
	Imagenes    []string `json:"imagenes" binding:"required,min=1"` 
}

func CrearProducto(c *gin.Context) {
	var req CrearProductoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos o falta al menos una imagen"})
		return
	}

	userIDStr := c.MustGet("userID").(string)
	vendedorID, _ := uuid.Parse(userIDStr)

	var parsedTiendaID *uuid.UUID
	if req.TiendaID != nil && *req.TiendaID != "" {
		tID, err := uuid.Parse(*req.TiendaID)
		if err == nil {
			parsedTiendaID = &tID
		}
	}

	stockFinal := req.Stock
	if stockFinal <= 0 {
		stockFinal = 1
	}

	nuevoProducto := models.Producto{
		VendedorID:  vendedorID,
		TiendaID:    parsedTiendaID,
		CategoriaID: req.CategoriaID,
		RegionID:    req.RegionID,
		FacultadID:  req.FacultadID,
		Nombre:      req.Nombre,
		Descripcion: req.Descripcion,
		Precio:      req.Precio,
		Stock:       stockFinal,
		Estado:      "disponible",
	}

	// Iniciar una transacción para asegurar que se guarde el producto Y sus imágenes
	tx := config.DB.Begin()

	if err := tx.Create(&nuevoProducto).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al publicar el producto"})
		return
	}

	// Iterar sobre las URLs recibidas y crear los registros de ImagenProducto
	for i, url := range req.Imagenes {
		img := models.ImagenProducto{
			ProductoID:  nuevoProducto.ID,
			UrlImagen:   url,
			EsPrincipal: i == 0, // La primera imagen enviada será la principal por defecto
		}
		if err := tx.Create(&img).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar las imágenes"})
			return
		}
	}

	tx.Commit()

	// Cargar las imágenes en la respuesta
	config.DB.Preload("Imagenes").First(&nuevoProducto, "id = ?", nuevoProducto.ID)

	c.JSON(http.StatusCreated, gin.H{
		"mensaje":  "Producto publicado exitosamente",
		"producto": nuevoProducto,
	})
}
// GET /api/v1/productos (Catálogo principal con filtros)
func ObtenerProductos(c *gin.Context) {
	var productos []models.Producto
	query := config.DB.Model(&models.Producto{}).Preload("Imagenes")

	// Aplicar filtros si vienen en la URL (?region_id=1&categoria_id=2&search=lapto)
	if regionID := c.Query("region_id"); regionID != "" {
		query = query.Where("region_id = ?", regionID)
	}
	if facultadID := c.Query("facultad_id"); facultadID != "" {
		query = query.Where("facultad_id = ?", facultadID)
	}
	if categoriaID := c.Query("categoria_id"); categoriaID != "" {
		query = query.Where("categoria_id = ?", categoriaID)
	}
	if search := c.Query("search"); search != "" {
		// ILIKE es la versión de PostgreSQL para búsqueda sin distinguir mayúsculas/minúsculas
		query = query.Where("nombre ILIKE ?", "%"+search+"%")
	}

	// Solo mostrar los que no estén ocultos
	query.Where("estado != ?", "oculto").Order("fecha_publicacion DESC").Find(&productos)
	c.JSON(http.StatusOK, productos)
}

// GET /api/v1/productos/:id (Detalle RF-006)
func ObtenerProductoPorID(c *gin.Context) {
	productoID := c.Param("id")
	var producto models.Producto

	if err := config.DB.Preload("Imagenes").First(&producto, "id = ?", productoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}
	c.JSON(http.StatusOK, producto)
}

// PUT /api/v1/productos/:id (Editar RF-007)
// PUT /api/v1/productos/:id
func ActualizarProducto(c *gin.Context) {
	productoID := c.Param("id")
	userIDStr := c.MustGet("userID").(string)

	var producto models.Producto
	if err := config.DB.First(&producto, "id = ?", productoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	if producto.VendedorID.String() != userIDStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para editar este producto"})
		return
	}

	var req CrearProductoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos o falta al menos una imagen"})
		return
	}

	// Iniciar transacción
	tx := config.DB.Begin()

	// 1. Actualizar datos base del producto
	producto.Nombre = req.Nombre
	producto.Descripcion = req.Descripcion
	producto.Precio = req.Precio
	producto.Stock = req.Stock
	producto.CategoriaID = req.CategoriaID
	producto.RegionID = req.RegionID
	producto.FacultadID = req.FacultadID

	if err := tx.Save(&producto).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar datos del producto"})
		return
	}

	// 2. Reemplazar imágenes: Primero borramos las actuales de la BD
	if err := tx.Where("producto_id = ?", producto.ID).Delete(&models.ImagenProducto{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al limpiar imágenes anteriores"})
		return
	}

	// 3. Insertar las nuevas imágenes
	for i, url := range req.Imagenes {
		img := models.ImagenProducto{
			ProductoID:  producto.ID,
			UrlImagen:   url,
			EsPrincipal: i == 0,
		}
		if err := tx.Create(&img).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar las nuevas imágenes"})
			return
		}
	}

	tx.Commit()

	// Cargar producto actualizado con sus imágenes
	config.DB.Preload("Imagenes").First(&producto, "id = ?", producto.ID)
	c.JSON(http.StatusOK, gin.H{"mensaje": "Producto actualizado", "producto": producto})
}

// DELETE /api/v1/productos/:id
func EliminarProducto(c *gin.Context) {
	productoID := c.Param("id")
	userIDStr := c.MustGet("userID").(string)

	var producto models.Producto
	if err := config.DB.First(&producto, "id = ?", productoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	if producto.VendedorID.String() != userIDStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permiso para eliminar este producto"})
		return
	}

	// Gracias al "ON DELETE CASCADE" en PostgreSQL, al eliminar el producto 
	// se eliminarán automáticamente sus registros en "imagenes_producto".
	if err := config.DB.Delete(&producto).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar el producto"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Producto y sus imágenes eliminados correctamente"})
}