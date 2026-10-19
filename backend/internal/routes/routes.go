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
		api.GET("/categorias", controllers.GetCategories)

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

						// --- Compras y ventas ---
			privadas.POST("/compras", controllers.CrearCompra)
			privadas.GET("/mis-compras", controllers.ObtenerMisCompras)
			privadas.GET("/mis-ventas", controllers.ObtenerMisVentas)
			privadas.PATCH("/compras/:id/estado", controllers.ActualizarEstadoCompra)

			// --- Mensajes ---
			privadas.POST("/mensajes", controllers.EnviarMensaje)
			privadas.GET("/conversaciones", controllers.ObtenerConversaciones)
			privadas.GET("/mensajes/:usuarioID", controllers.ObtenerMensajes)

						// --- Carrito ---
			privadas.GET("/carrito", controllers.ObtenerCarrito)
			privadas.POST("/carrito", controllers.AgregarCarrito)
			privadas.POST("/carrito/comprar", controllers.ComprarCarrito)
			privadas.PATCH("/carrito/:productoID", controllers.ActualizarCarrito)
			privadas.DELETE("/carrito/:productoID", controllers.QuitarCarrito)

			// --- Favoritos ---
			privadas.GET("/favoritos", controllers.ObtenerFavoritos)
			privadas.POST("/favoritos/:productoID", controllers.AlternarFavorito)

						// --- Catálogo ---
			privadas.GET("/catalogo", controllers.ObtenerCatalogo)

			// --- Reportes ---
			privadas.POST("/reportes", controllers.CrearReporte)
			privadas.GET("/mis-reportes", controllers.ObtenerMisReportes)

			// --- Mis publicaciones y estado ---
			privadas.GET("/mis-productos", controllers.ObtenerMisProductos)
			privadas.PATCH("/productos/:id/estado", controllers.CambiarEstadoProducto)
			privadas.GET("/puestos", controllers.ListarPuestos)
			// --- Subida de archivos ---
			privadas.POST("/upload", controllers.SubirImagen)

						privadas.GET("/puestos", controllers.ListarPuestos)
			privadas.PATCH("/productos/:id/tienda", controllers.AsignarProductoTienda)
		}
	}
}