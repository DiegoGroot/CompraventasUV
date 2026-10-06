package main

import (
	"context"
	"log"
	"os"
	"strings"

	"compraventasb/internal/config"
)

func main() {
	config.ConnectDatabase()

	migration, err := os.ReadFile("migrations/0001_add_username.sql")
	if err != nil {
		log.Fatal("No se pudo leer la migración:", err)
	}

	database, err := config.DB.DB()
	if err != nil {
		log.Fatal("No se pudo obtener la conexión SQL:", err)
	}

	transaction, err := database.BeginTx(context.Background(), nil)
	if err != nil {
		log.Fatal("No se pudo iniciar la migración:", err)
	}

	for _, statement := range strings.Split(string(migration), ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}
		if _, err := transaction.ExecContext(context.Background(), statement); err != nil {
			_ = transaction.Rollback()
			log.Fatal("Falló la migración:", err)
		}
	}

	if err := transaction.Commit(); err != nil {
		log.Fatal("No se pudo confirmar la migración:", err)
	}

	log.Println("Migración de username aplicada correctamente")
}
