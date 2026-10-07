package models

import (
	"time"

	"github.com/google/uuid"
)

type Producto struct {
	ID               uuid.UUID        `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	VendedorID       uuid.UUID        `gorm:"type:uuid;not null"`
	TiendaID         *uuid.UUID       `gorm:"type:uuid"`
	CategoriaID      uint             `gorm:"not null"`
	RegionID         uint             `gorm:"not null"`
	FacultadID       uint             `gorm:"not null"`
	Nombre           string           `gorm:"not null"`
	Descripcion      string
	Precio           float64          `gorm:"type:decimal(10,2);not null"`
	Stock            int              `gorm:"default:1"`
	Estado           string           `gorm:"type:estado_producto;default:'disponible'"`
	FechaPublicacion time.Time        `gorm:"autoCreateTime"`
	
	// Relación 1 a Muchos con las imágenes
	Imagenes         []ImagenProducto `gorm:"foreignKey:ProductoID"`
}

func (Producto) TableName() string { return "productos" }

// Nuevo modelo para la tabla de imágenes
type ImagenProducto struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	ProductoID  uuid.UUID `gorm:"type:uuid;not null"`
	UrlImagen   string    `gorm:"type:varchar(255);not null"`
	PesoMb      float64   `gorm:"type:decimal(5,2)"`
	EsPrincipal bool      `gorm:"default:false"`
}

func (ImagenProducto) TableName() string { return "imagenes_producto" }