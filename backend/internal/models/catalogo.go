package models

type Region struct {
	ID     uint   `gorm:"primaryKey"`
	Nombre string `gorm:"unique;not null"`
}

func (Region) TableName() string { return "regiones" }

type Facultad struct {
	ID       uint   `gorm:"primaryKey"`
	RegionID uint   `gorm:"not null"`
	Nombre   string `gorm:"not null"`
}

func (Facultad) TableName() string { return "facultades" }