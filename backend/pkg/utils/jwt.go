package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateJWT(userID uuid.UUID, rol string) (string, error) {
	secretKey := []byte(os.Getenv("JWT_SECRET"))

	// Crear el payload del token (Claims)
	claims := jwt.MapClaims{
		"sub": userID.String(),
		"rol": rol,
		"exp": time.Now().Add(time.Hour * 24).Unix(), // Expira en 24 horas
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}