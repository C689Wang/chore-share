package controller

import (
	"chore-share/models"
	"chore-share/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	service service.DBService
}

func NewController(service service.DBService) *Controller {
	return &Controller{service: service}
}

func (c *Controller) CreateAccount(ctx *gin.Context) {
	var body models.CreateAccountRequestBody
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account := models.Account{
		GoogleId: body.GoogleId,
		Name:     body.Name,
	}

	response, err := c.service.CreateAccount(&account)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GetAccount(ctx *gin.Context) {
	accountUUID := ctx.Param("accountId")
	accountId, err := uuid.Parse(accountUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account, err := c.service.GetAccount(accountId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, account)
}

func (c *Controller) GetAccountByGoogleId(ctx *gin.Context) {
	googleId := ctx.Param("googleId")
	account, err := c.service.GetAccountByGoogleId(googleId)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, account)
}

func (c *Controller) CreateChore(ctx *gin.Context) {
	var body models.CreateChoreRequestBody

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	householdID, err := uuid.Parse(ctx.Param("householdId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse assignee IDs
	assignees := make([]uuid.UUID, len(body.AssigneeIDs))
	for i, id := range body.AssigneeIDs {
		assigneeID, err := uuid.Parse(id)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		assignees[i] = assigneeID
	}

	// Create chore
	choreType := models.ChoreType(body.Type)
	frequencyType := models.FrequencyType(body.Frequency)
	
	chore := &models.Chore{
		Title:         body.Title,
		Description:   body.Description,
		HouseholdID:   householdID,
		Type:          choreType,
		Status:        models.ChoreStatusPending,
	}

	if choreType == models.ChoreTypeRecurring {
		chore.EndDate = body.EndDate
		chore.FrequencyType = &frequencyType
	}

	// Create schedule for recurring chores
	var schedule []models.ChoreSchedule
	if choreType == models.ChoreTypeRecurring {
		schedule = make([]models.ChoreSchedule, len(body.Schedule))
		for i, day := range body.Schedule {
			schedule[i] = models.ChoreSchedule{
				DayOfWeek: day,
			}
		}
	}

	if err := c.service.CreateChore(chore, assignees, schedule); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Chore created successfully",
		"id":      chore.ID,
	})
}

func (c *Controller) CreateHousehold(ctx *gin.Context) {
	var body models.CreateHouseholdRequestBody
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accountUUID := ctx.Param("accountId")
	accountId, err := uuid.Parse(accountUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	household := models.Household{
		Password: body.Password,
		Name:     body.Name,
	}
	if err := c.service.CreateHousehold(&household); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := models.CreateHouseholdResponse{
		ID:   household.ID,
		Name: household.Name,
	}

	if err := c.service.JoinHousehold(household.ID, accountId, body.Password); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *Controller) JoinHousehold(ctx *gin.Context) {
	var body models.JoinHouseholdRequestBody
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	householdId, err := uuid.Parse(body.HouseholdID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accountId, err := uuid.Parse(body.AccountID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.JoinHousehold(householdId, accountId, body.Password); err != nil {
		if err.Error() == "invalid password" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Successfully joined household"})
}

func (c *Controller) GetAccountHouseholds(ctx *gin.Context) {
	accountUUID := ctx.Param("accountId")
	accountId, err := uuid.Parse(accountUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	households, err := c.service.GetAccountHouseholds(accountId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, households)
}	

func (c *Controller) GetHouseholdChores(ctx *gin.Context) {
	householdUUID := ctx.Param("householdId")
	householdId, err := uuid.Parse(householdUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	chores, err := c.service.GetHouseholdChores(householdId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, chores)
}

func (c *Controller) GetHouseholdLeaderboard(ctx *gin.Context) {
	householdUUID := ctx.Param("householdId")
	householdId, err := uuid.Parse(householdUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	leaderboard, err := c.service.GetHouseholdLeaderboard(householdId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, leaderboard)
}

func (c *Controller) GetAccountChores(ctx *gin.Context) {
	accountUUID := ctx.Param("accountId")
	accountId, err := uuid.Parse(accountUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	householdUUID := ctx.Param("householdId")
	householdId, err := uuid.Parse(householdUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chores, err := c.service.GetAccountChores(accountId, householdId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, chores)
}

func (c *Controller) GetHouseholdMembers(ctx *gin.Context) {
	householdUUID := ctx.Param("householdId")
	householdId, err := uuid.Parse(householdUUID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	members, err := c.service.GetHouseholdMembers(householdId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, members)
}