package main

import (
	"chore-share/controller"
	"chore-share/service"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	dbUrl := os.Getenv("DATABASE_URL")

	dbService := service.NewDBService(dbUrl)
	controller := controller.NewController(dbService)

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
  r.POST("/api/account", controller.CreateAccount)
  r.POST("/api/chore", controller.CreateChore)
  r.POST("/api/household", controller.CreateHousehold)
  r.POST("/api/household/join", controller.JoinHousehold)
  r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}