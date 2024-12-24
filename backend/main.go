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
	r.POST("/api/account/:accountId/household", controller.CreateHousehold)
	r.POST("/api/account/:accountId/household/join", controller.JoinHousehold)
	r.GET("/api/account/:accountId", controller.GetAccount)
	r.GET("/api/account/google/:googleId", controller.GetAccountByGoogleId)
	r.GET("/api/account/:accountId/household", controller.GetAccountHouseholds)
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}