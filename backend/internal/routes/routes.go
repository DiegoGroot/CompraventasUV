package routes

import (
	"compraventasb/internal/controllers"
	"compraventasb/internal/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		// RUTAS PÚBLICAS (No requieren token)
		api.POST("/login", controllers.Login)
		api.POST("/registro", controllers.Register)
		api.GET("/regiones", controllers.GetRegions)
		api.GET("/regiones/:regionID/facultades", controllers.GetFaculties)

		// RUTAS PRIVADAS (Requieren token JWT)
		privadas := api.Group("/")
		privadas.Use(middlewares.RequireAuth()) // Aplicar el middleware
		{
			// Ruta de prueba para validar que el token funciona
			privadas.GET("/perfil", func(c *gin.Context) {
				// Recuperar los datos que guardó el middleware
				userID, _ := c.Get("userID")
				rol, _ := c.Get("rol")

				c.JSON(200, gin.H{
					"mensaje":    "Acceso permitido a ruta protegida",
					"usuario_id": userID,
					"rol":        rol,
				})
			})
			// --- CRUD Tiendas ---
			privadas.POST("/tiendas", controllers.CrearTienda)
			privadas.GET("/mis-tiendas", controllers.ObtenerMisTiendas)
			privadas.PUT("/tiendas/:id", controllers.ActualizarTienda)
			privadas.DELETE("/tiendas/:id", controllers.EliminarTienda)

			// --- CRUD Productos ---
			privadas.POST("/productos", controllers.CrearProducto)
			privadas.GET("/productos", controllers.ObtenerProductos)
			privadas.GET("/productos/:id", controllers.ObtenerProductoPorID)
			privadas.PUT("/productos/:id", controllers.ActualizarProducto)
			privadas.DELETE("/productos/:id", controllers.EliminarProducto)

			// --- Subida de archivos ---
			privadas.POST("/upload", controllers.SubirImagen)

            // --- Pedidos ---
			privadas.POST("/pedidos/directo", controllers.RealizarCompraDirecta)
			privadas.GET("/mis-compras", controllers.ObtenerMisCompras)
			privadas.GET("/mis-ventas", controllers.ObtenerMisVentas)
			privadas.PATCH("/mis-ventas/:id/estado", controllers.ActualizarEstadoPedido) 

            // --- Carrito ---
			privadas.POST("/carrito", controllers.AgregarAlCarrito)
			privadas.GET("/carrito", controllers.ObtenerCarrito)
			privadas.DELETE("/carrito/:id", controllers.EliminarDelCarrito)
			privadas.DELETE("/carrito", controllers.VaciarCarrito)
			privadas.POST("/carrito/checkout", controllers.CheckoutCarrito) 

			// --- Favoritos ---
			privadas.POST("/favoritos", controllers.AgregarFavorito)
			privadas.GET("/favoritos", controllers.ObtenerFavoritos)
			privadas.DELETE("/favoritos/:producto_id", controllers.EliminarFavorito)

			// --- Mensajería ---
			privadas.POST("/mensajes", controllers.EnviarMensaje)
			privadas.GET("/mensajes/inbox", controllers.ObtenerBandejaEntrada) // <-- AÑADIR ESTA AQUÍ
			privadas.GET("/mensajes/:receptor_id/:producto_id", controllers.ObtenerHistorialChat)
		}
	}
}
