package main

import (
	"fmt"
	"log"
	"os"
	"time" // <-- Agregar import time

	"compraventasb/internal/config"
	"compraventasb/internal/routes"

	"github.com/gin-contrib/cors" // <-- Agregar import de cors
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()
	fmt.Println("Servidor backend inicializado correctamente.")

	r := gin.Default()

	// CONFIGURACIÓN DE CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, // Puertos de Vite y CRA
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.SetupRoutes(r)
	
	// Servir la carpeta "uploads" como archivos estáticos
	r.Static("/uploads", "./uploads")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor corriendo en http://localhost:%s\n", port)
	r.Run(":" + port)
}