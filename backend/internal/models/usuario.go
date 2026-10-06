package models

import (
	"time"

	"github.com/google/uuid"
)

type Usuario struct {
	ID                  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Username            string    `gorm:"unique;not null"` // <-- Nuevo campo
	CorreoInstitucional string    `gorm:"unique;not null"`
	PasswordHash        string    `gorm:"not null"`
	RegionID            uint      `gorm:"not null"`
	Region              Region    `gorm:"foreignKey:RegionID"`
	FacultadID          uint      `gorm:"not null"`
	Facultad            Facultad  `gorm:"foreignKey:FacultadID"`
	Rol                 string    `gorm:"type:rol_usuario;default:'estudiante'"`
	Estado              string    `gorm:"type:estado_usuario;default:'inactivo'"`
	FechaRegistro       time.Time `gorm:"autoCreateTime"`
}

func (Usuario) TableName() string { return "usuarios" }