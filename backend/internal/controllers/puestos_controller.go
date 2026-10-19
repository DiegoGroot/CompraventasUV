package controllers

import (
	"net/http"
	"time"

	"compraventasb/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PuestoProductoMini struct {
	ID       uuid.UUID `json:"id"`
	TiendaID uuid.UUID `json:"-"`
	Nombre   string    `json:"nombre"`
	Precio   float64   `json:"precio"`
	Imagen   *string   `json:"imagen"`
}

type PuestoPublico struct {
	ID             uuid.UUID            `json:"id"`
	Nombre         string               `json:"nombre"`
	Descripcion    *string              `json:"descripcion"`
	Imagen         *string              `json:"imagen"`
	FechaCreacion  *time.Time           `json:"fecha_creacion"`
	VendedorID     uuid.UUID            `json:"vendedor_id"`
	Vendedor       string               `json:"vendedor"`
	Campus         string               `json:"campus"`
	Categoria      string               `json:"categoria"`
	TotalProductos int                  `json:"total_productos"`
	Productos      []PuestoProductoMini `json:"productos" gorm:"-"`
}

// GET /api/v1/puestos -> todas las tiendas con hasta 3 productos disponibles
func ListarPuestos(c *gin.Context) {
	puestos := []PuestoPublico{}
	err := config.DB.Raw(`
		SELECT t.id, t.nombre, t.descripcion, t.imagen_link AS imagen, t.fecha_creacion,
		       t.vendedor_id, u.username AS vendedor,
		       COALESCE(r.nombre, '') AS campus, COALESCE(ca.nombre, '') AS categoria,
		       (SELECT COUNT(*) FROM productos p
		         WHERE p.tienda_id = t.id AND p.estado = 'disponible' AND p.stock > 0) AS total_productos
		FROM tiendas t
		JOIN usuarios u ON u.id = t.vendedor_id
		LEFT JOIN regiones r ON r.id = t.region_id
		LEFT JOIN categorias ca ON ca.id = t.categoria_principal_id
		ORDER BY t.fecha_creacion DESC`).Scan(&puestos).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar los puestos"})
		return
	}

	if len(puestos) > 0 {
		ids := make([]string, 0, len(puestos))
		for _, p := range puestos {
			ids = append(ids, p.ID.String())
		}

		minis := []PuestoProductoMini{}
		err = config.DB.Raw(`
			SELECT x.id, x.tienda_id, x.nombre, x.precio, x.imagen FROM (
			  SELECT p.id, p.tienda_id, p.nombre, p.precio,
			         (SELECT i.url_imagen FROM imagenes_producto i
			           WHERE i.producto_id = p.id ORDER BY i.es_principal DESC LIMIT 1) AS imagen,
			         ROW_NUMBER() OVER (PARTITION BY p.tienda_id ORDER BY p.fecha_publicacion DESC) AS rn
			  FROM productos p
			  WHERE p.tienda_id IN ? AND p.estado = 'disponible' AND p.stock > 0
			) x WHERE x.rn <= 3`, ids).Scan(&minis).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron cargar los productos de los puestos"})
			return
		}

		porTienda := map[uuid.UUID][]PuestoProductoMini{}
		for _, m := range minis {
			porTienda[m.TiendaID] = append(porTienda[m.TiendaID], m)
		}
		for i := range puestos {
			puestos[i].Productos = porTienda[puestos[i].ID]
			if puestos[i].Productos == nil {
				puestos[i].Productos = []PuestoProductoMini{}
			}
		}
	}

	c.JSON(http.StatusOK, puestos)
}