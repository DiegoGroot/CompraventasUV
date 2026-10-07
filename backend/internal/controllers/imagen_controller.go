package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// POST /api/v1/upload
func SubirImagen(c *gin.Context) {
	// 1. Extraer el archivo del formulario (la key en React será "file")
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No se recibió ninguna imagen"})
		return
	}

	// 2. Validar extensiones y peso (RNF-006: Máximo 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La imagen excede el límite de 5MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato no permitido. Solo JPG, PNG o WEBP"})
		return
	}

	// 3. Generar un nombre único
	nuevoNombre := uuid.New().String() + ext
	rutaDestino := filepath.Join("uploads", nuevoNombre)

	// 4. Guardar el archivo en el servidor
	if err := c.SaveUploadedFile(file, rutaDestino); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar la imagen en el servidor"})
		return
	}

	// 5. Devolver la URL pública (asumiendo que el server corre en localhost:8080)
	// En producción, reemplazarías localhost con tu dominio real.
	urlPublica := fmt.Sprintf("http://localhost:8080/uploads/%s", nuevoNombre)

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "Imagen subida con éxito",
		"url":     urlPublica,
	})
}