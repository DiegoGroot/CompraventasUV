package models

import (
	"time"

	"github.com/google/uuid"
)

type CarritoItem struct {
	ID            uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UsuarioID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_producto"`
	ProductoID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_producto"`
	Cantidad      int       `gorm:"not null;default:1"`
	FechaAgregado time.Time `gorm:"autoCreateTime"`

	// Relación para traer la información del producto
	Producto Producto `gorm:"foreignKey:ProductoID"`
}

func (CarritoItem) TableName() string { return "carrito_items" }