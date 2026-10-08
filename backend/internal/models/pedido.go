package models

import (
	"time"

	"github.com/google/uuid"
)

type Pedido struct {
	ID              uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	CompradorID     uuid.UUID `gorm:"type:uuid;not null"`
	VendedorID      uuid.UUID `gorm:"type:uuid;not null"`
	TiendaID        *uuid.UUID `gorm:"type:uuid"`
	Total           float64   `gorm:"type:decimal(10,2);not null"`
	Estado          string    `gorm:"type:estado_pedido;default:'pendiente'"`
	FechaPedido     time.Time `gorm:"autoCreateTime"`
	EsCompraDirecta bool      `gorm:"default:false"`

	// Relación 1 a Muchos
	Detalles []DetallePedido `gorm:"foreignKey:PedidoID"`
}

func (Pedido) TableName() string { return "pedidos" }

type DetallePedido struct {
	ID             uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	PedidoID       uuid.UUID `gorm:"type:uuid;not null"`
	ProductoID     uuid.UUID `gorm:"type:uuid;not null"`
	Cantidad       int       `gorm:"not null"`
	PrecioUnitario float64   `gorm:"type:decimal(10,2);not null"`
	Producto       Producto  `gorm:"foreignKey:ProductoID"`
}

func (DetallePedido) TableName() string { return "detalles_pedido" }