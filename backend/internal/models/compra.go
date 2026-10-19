package models

import (
	"time"

	"github.com/google/uuid"
)

type Compra struct {
	ID             uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	CompradorID    uuid.UUID  `gorm:"type:uuid;not null" json:"comprador_id"`
	VendedorID     uuid.UUID  `gorm:"type:uuid;not null" json:"vendedor_id"`
	ProductoID     *uuid.UUID `gorm:"type:uuid" json:"producto_id"`
	NombreProducto string     `gorm:"not null" json:"nombre_producto"`
	Cantidad       int        `gorm:"not null;default:1" json:"cantidad"`
	PrecioUnitario float64    `gorm:"type:decimal(10,2);not null" json:"precio_unitario"`
	Estado         string     `gorm:"not null;default:'pendiente'" json:"estado"`
	FechaCompra    time.Time  `gorm:"autoCreateTime" json:"fecha_compra"`
}

func (Compra) TableName() string { return "compras" }

type Mensaje struct {
	ID         uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	DeID       uuid.UUID  `gorm:"type:uuid;not null" json:"de_id"`
	ParaID     uuid.UUID  `gorm:"type:uuid;not null" json:"para_id"`
	ProductoID *uuid.UUID `gorm:"type:uuid" json:"producto_id"`
	Contenido  string     `gorm:"not null" json:"contenido"`
	Leido      bool       `gorm:"not null;default:false" json:"leido"`
	Fecha      time.Time  `gorm:"autoCreateTime" json:"fecha"`
}

func (Mensaje) TableName() string { return "mensajes" }