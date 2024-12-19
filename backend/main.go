package main

import (
	"chore-share/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
  r.POST("/login", service.Login)
  r.GET("/api/account/:accountId", service.GetAccountById)
  r.POST("/api/chore", service.CreateChore)
  r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}