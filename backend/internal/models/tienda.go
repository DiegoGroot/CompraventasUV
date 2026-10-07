package models

import (
	"time"
	"github.com/google/uuid"
)

type Tienda struct {
	ID                   uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	VendedorID           uuid.UUID `gorm:"type:uuid;not null"`
	CategoriaPrincipalID uint      `gorm:"not null"`
	RegionID             uint      `gorm:"not null"`
	FacultadID           uint      `gorm:"not null"`
	Nombre               string    `gorm:"not null"`
	Descripcion          string
	ImagenLink           *string   `gorm:"type:varchar(255)"` // Puntero para permitir NULL
	FechaCreacion        time.Time `gorm:"autoCreateTime"`
}

func (Tienda) TableName() string { return "tiendas" }