package models

import (
	"time"
)

type CreateAccountRequestBody struct {
	GoogleId    string `json:"google_id"`
	Name string `json:"name"`
}

type CreateHouseholdRequestBody struct {
	Name string `json:"name"`
	Password string `json:"password"`
}

type JoinHouseholdRequestBody struct {
	HouseholdID string `json:"householdId" binding:"required"`
	Password    string `json:"password" binding:"required"`
	AccountID   string `json:"accountId" binding:"required"`
}

type CreateChoreRequestBody struct {
	Title        string    `json:"title" binding:"required"`
	Description  string    `json:"description"`
	Type         string    `json:"type" binding:"required"`
	EndDate      time.Time `json:"endDate"`
	Frequency    string    `json:"frequency"`
	Schedule     []int     `json:"schedule"` // Days of week for recurring
	AssigneeIDs  []string  `json:"assigneeIds" binding:"required"`
	Points       int       `json:"points" binding:"required"`
}

type CreateTransactionRequestBody struct {
	Description   string    `json:"description"`
	AmountInCents int64     `json:"amountInCents"`
	SpentAt       time.Time `json:"spentAt"`
}
