package models

import (
	"time"

	"github.com/google/uuid"
)

type Favorito struct {
	ID            uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UsuarioID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_producto_fav"`
	ProductoID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_usuario_producto_fav"`
	FechaAgregado time.Time `gorm:"autoCreateTime"`

	// Relación para traer la información del producto
	Producto Producto `gorm:"foreignKey:ProductoID"`
}

func (Favorito) TableName() string { return "favoritos" }