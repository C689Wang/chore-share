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
	r.POST("/api/accounts", controller.CreateAccount)
	r.POST("/api/accounts/:accountId/households/:householdId/chores", controller.CreateChore)
	r.GET("/api/accounts/:accountId/households/:householdId/chores", controller.GetAccountChores)
	r.GET("/api/households/:householdId/chores", controller.GetHouseholdChores)
	r.GET("/api/households/:householdId/leaderboard", controller.GetHouseholdLeaderboard)
	r.POST("/api/accounts/:accountId/households", controller.CreateHousehold)
	r.POST("/api/accounts/:accountId/households/join", controller.JoinHousehold)
	r.GET("/api/accounts/:accountId", controller.GetAccount)
	r.GET("/api/accounts/google/:googleId", controller.GetAccountByGoogleId)
	r.GET("/api/accounts/:accountId/households", controller.GetAccountHouseholds)
	r.GET("/api/households/:householdId/members", controller.GetHouseholdMembers)
	r.PUT("/api/accounts/:accountId/households/:householdId/chores/:accountChoreId/complete", controller.CompleteChore)
	r.POST("/api/accounts/:accountId/households/:householdId/transactions", controller.CreateTransaction)
	r.GET("/api/accounts/:accountId/households/:householdId/transactions", controller.GetTransactions)
	r.GET("/api/accounts/:accountId/households/:householdId/transactions/summary", controller.GetTransactionSummary)
	r.GET("/api/transactions/:transactionId/splits", controller.GetTransactionSplits)
	r.PUT("/api/transactions/splits/:splitId/settle", controller.SettleTransactionSplit)
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}