package controllers

import (
	"database/sql"
	"net/http"
	"time"

	"compraventasb/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CatalogoItem struct {
	ID               uuid.UUID  `json:"id"`
	Nombre           string     `json:"nombre"`
	Descripcion      *string    `json:"descripcion"`
	Precio           float64    `json:"precio"`
	Stock            int        `json:"stock"`
	Estado           string     `json:"estado"`
	FechaPublicacion *time.Time `json:"fecha_publicacion"`
	VendedorID       uuid.UUID  `json:"vendedor_id"`
	Vendedor         string     `json:"vendedor"`
	Campus           string     `json:"campus"`
	Categoria        string     `json:"categoria"`
	Imagen           *string    `json:"imagen"`
	Favorito         bool       `json:"favorito"`
}

const catalogoSelect = `
	SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.estado::text AS estado,
	       p.fecha_publicacion, p.vendedor_id, u.username AS vendedor,
	       COALESCE(r.nombre, '') AS campus, COALESCE(ca.nombre, '') AS categoria,
	       (SELECT i.url_imagen FROM imagenes_producto i
	         WHERE i.producto_id = p.id ORDER BY i.es_principal DESC LIMIT 1) AS imagen,
	       EXISTS(SELECT 1 FROM favoritos f WHERE f.producto_id = p.id AND f.usuario_id = @u) AS favorito
	FROM productos p
	JOIN usuarios u ON u.id = p.vendedor_id
	LEFT JOIN regiones r ON r.id = p.region_id
	LEFT JOIN categorias ca ON ca.id = p.categoria_id
	WHERE `

// GET /api/v1/catalogo            -> productos disponibles de otros usuarios
// GET /api/v1/catalogo?favoritos=1 -> favoritos del usuario (cualquier estado)
func ObtenerCatalogo(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	cond := `p.estado = 'disponible' AND p.stock > 0 AND p.vendedor_id <> @u`
	if c.Query("favoritos") == "1" {
		cond = `p.id IN (SELECT producto_id FROM favoritos WHERE usuario_id = @u)`
	}

	out := []CatalogoItem{}
	err := config.DB.Raw(catalogoSelect+cond+` ORDER BY p.fecha_publicacion DESC`, sql.Named("u", userID)).Scan(&out).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo cargar el catálogo"})
		return
	}
	c.JSON(http.StatusOK, out)
}