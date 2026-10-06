package controllers

import (
	"net/http"
	"strings"

	"compraventasb/internal/config"
	"compraventasb/internal/models"
	"compraventasb/pkg/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

)

// Estructura para recibir el JSON de React
type LoginRequest struct {
	Identificador string `json:"identificador" binding:"required"` // <-- Acepta correo o username
	Password      string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var usuario models.Usuario

	// Buscar por correo institucional OR username
	if err := config.DB.Where("correo_institucional = ? OR username = ?", req.Identificador, req.Identificador).First(&usuario).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales incorrectas"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(usuario.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales incorrectas"})
		return
	}

	if usuario.Estado != "activo" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cuenta inactiva. Verifica tu correo institucional."})
		return
	}

	tokenString, err := utils.GenerateJWT(usuario.ID, usuario.Rol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar el token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "Inicio de sesión exitoso",
		"token":   tokenString,
		"usuario": gin.H{
			"id":       usuario.ID,
			"username": usuario.Username,
			"correo":   usuario.CorreoInstitucional,
			"rol":      usuario.Rol,
		},
	})
}
// Estructura para recibir el JSON de registro desde React
type RegisterRequest struct {
	Username   string `json:"username" binding:"required,min=3"` // <-- Nuevo campo
	Correo     string `json:"correo" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	RegionID   uint   `json:"region_id" binding:"required"`
	FacultadID uint   `json:"facultad_id" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos incompletos o formato inválido"})
		return
	}

	if !strings.HasSuffix(req.Correo, "@estudiantes.uv.mx") && !strings.HasSuffix(req.Correo, "@uv.mx") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Debe ser un correo institucional válido (@estudiantes.uv.mx o @uv.mx)"})
		return
	}

	// Verificar si el correo o el username ya existen
	var usuarioExistente models.Usuario
	if err := config.DB.Where("correo_institucional = ? OR username = ?", req.Correo, req.Username).First(&usuarioExistente).Error; err == nil {
		if usuarioExistente.CorreoInstitucional == req.Correo {
			c.JSON(http.StatusConflict, gin.H{"error": "El correo ya está registrado"})
		} else {
			c.JSON(http.StatusConflict, gin.H{"error": "El nombre de usuario ya está en uso"})
		}
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la contraseña"})
		return
	}

	nuevoUsuario := models.Usuario{
		Username:            req.Username, // <-- Guardar el username
		CorreoInstitucional: req.Correo,
		PasswordHash:        string(hashedPassword),
		RegionID:            req.RegionID,
		FacultadID:          req.FacultadID,
		Estado:              "activo",
		Rol:                 "estudiante",
	}

	if err := config.DB.Create(&nuevoUsuario).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la cuenta"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Cuenta creada exitosamente",
		"usuario": gin.H{
			"id":       nuevoUsuario.ID,
			"username": nuevoUsuario.Username,
			"correo":   nuevoUsuario.CorreoInstitucional,
		},
	})
}