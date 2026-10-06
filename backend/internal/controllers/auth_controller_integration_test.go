package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"compraventasb/internal/config"
	"compraventasb/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func TestRegisterAndLoginUseUsernameAndEmail(t *testing.T) {
	if os.Getenv("RUN_DB_INTEGRATION") != "1" {
		t.Skip("set RUN_DB_INTEGRATION=1 to run against PostgreSQL")
	}

	if err := godotenv.Load("../../.env"); err != nil {
		t.Fatalf("load backend environment: %v", err)
	}
	config.ConnectDatabase()
	originalDB := config.DB
	transaction := originalDB.Begin()
	if transaction.Error != nil {
		t.Fatalf("begin database transaction: %v", transaction.Error)
	}
	config.DB = transaction
	t.Cleanup(func() {
		config.DB = originalDB
		_ = transaction.Rollback().Error
	})

	var region models.Region
	if err := transaction.First(&region).Error; err != nil {
		t.Fatalf("load test region: %v", err)
	}
	var faculty models.Facultad
	if err := transaction.Where("region_id = ?", region.ID).First(&faculty).Error; err != nil {
		t.Fatalf("load test faculty: %v", err)
	}

	username := "itest_" + uuid.NewString()[:8]
	email := username + "@estudiantes.uv.mx"
	registerBody := map[string]any{
		"username":    username,
		"correo":      email,
		"password":    "integration-password-123",
		"region_id":   region.ID,
		"facultad_id": faculty.ID,
	}
	registerResponse := invokeJSON(t, Register, registerBody)
	if registerResponse.Code != http.StatusCreated {
		t.Fatalf("register status = %d, body = %s", registerResponse.Code, registerResponse.Body.String())
	}

	var storedUser models.Usuario
	if err := transaction.Where("username = ?", username).First(&storedUser).Error; err != nil {
		t.Fatalf("registered user not persisted in transaction: %v", err)
	}

	for _, identifier := range []string{username, email} {
		loginResponse := invokeJSON(t, Login, map[string]string{
			"identificador": identifier,
			"password":      "integration-password-123",
		})
		if loginResponse.Code != http.StatusOK {
			t.Errorf("login with %q status = %d, body = %s", identifier, loginResponse.Code, loginResponse.Body.String())
		}
	}
}

func invokeJSON(t *testing.T, handler gin.HandlerFunc, body any) *httptest.ResponseRecorder {
	t.Helper()

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}
	response := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(response)
	context.Request = httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(payload))
	context.Request.Header.Set("Content-Type", "application/json")
	handler(context)
	return response
}
