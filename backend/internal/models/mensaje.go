package models

import (
	"time"

	"github.com/google/uuid"
)

type Mensaje struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	RemitenteID uuid.UUID `gorm:"type:uuid;not null"`
	ReceptorID  uuid.UUID `gorm:"type:uuid;not null"`
	ProductoID  uuid.UUID `gorm:"type:uuid;not null"`
	Contenido   string    `gorm:"type:text;not null"`
	Leido       bool      `gorm:"default:false"`
	FechaEnvio  time.Time `gorm:"autoCreateTime"`

	// Relaciones para traer detalles si es necesario
	Remitente Usuario  `gorm:"foreignKey:RemitenteID"`
	Receptor  Usuario  `gorm:"foreignKey:ReceptorID"`
	Producto  Producto `gorm:"foreignKey:ProductoID"`
}

func (Mensaje) TableName() string { return "mensajes" }