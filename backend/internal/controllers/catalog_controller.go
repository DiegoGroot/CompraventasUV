package controllers

import (
	"net/http"
	"strconv"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
)

type CatalogOption struct {
	ID     uint   `json:"id"`
	Nombre string `json:"nombre"`
}

func GetRegions(c *gin.Context) {
	var regions []models.Region
	if err := config.DB.Order("nombre ASC").Find(&regions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar las regiones"})
		return
	}

	options := make([]CatalogOption, 0, len(regions))
	for _, region := range regions {
		options = append(options, CatalogOption{ID: region.ID, Nombre: region.Nombre})
	}
	c.JSON(http.StatusOK, options)
}

func GetFaculties(c *gin.Context) {
	regionID, err := strconv.ParseUint(c.Param("regionID"), 10, 64)
	if err != nil || regionID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La región indicada no es válida"})
		return
	}

	var faculties []models.Facultad
	if err := config.DB.Where("region_id = ?", regionID).Order("nombre ASC").Find(&faculties).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar las facultades"})
		return
	}

	options := make([]CatalogOption, 0, len(faculties))
	for _, faculty := range faculties {
		options = append(options, CatalogOption{ID: faculty.ID, Nombre: faculty.Nombre})
	}
	c.JSON(http.StatusOK, options)
}
