package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountResponse struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	GoogleId string    `json:"googleId"`
}

type ChoreResponse struct {
	ID          uuid.UUID    `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Type        ChoreType    `json:"type"`
	HouseholdID uuid.UUID    `json:"householdId"`
	CreatedAt   time.Time    `json:"createdAt"`
}

type AccountChoreResponse struct {
	ID          uuid.UUID        `json:"id"`
	ChoreID     uuid.UUID        `json:"choreId"`
	AccountID   uuid.UUID        `json:"accountId"`
	AccountName string           `json:"accountName"`
	DueDate     time.Time        `json:"dueDate"`
	Status      AssignmentStatus `json:"status"`
	CompletedAt *time.Time       `json:"completedAt"`
	Points      int              `json:"points"`
	Chore       ChoreResponse    `json:"chore"`
}

type HouseholdResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type LeaderboardEntryResponse struct {
	AccountID   uuid.UUID `json:"accountId"`
	AccountName string    `json:"accountName"`
	Points      uint      `json:"points"`
}

type HouseholdMemberResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
} 

type CreateHouseholdResponse struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"name"`
}

type ChoreAssignmentResponse struct {
	ID            uuid.UUID        `json:"id"`
	ChoreID       uuid.UUID        `json:"choreId"`
	AssigneeID    uuid.UUID        `json:"assigneeId"`
	AssigneeName  string          `json:"assigneeName"`
	ScheduledDate time.Time        `json:"scheduledDate"`
	DueDate       time.Time        `json:"dueDate"`
	CompletedAt   *time.Time       `json:"completedAt"`
	Status        AssignmentStatus `json:"status"`
	RotationOrder int              `json:"rotationOrder"`
	IsCurrentAssignee bool         `json:"isCurrentAssignee"`
}

type TransactionResponse struct {
	ID            uuid.UUID  `json:"id"`
	Name          string     `json:"name"`
	Description   string     `json:"description"`
	AmountInCents int       `json:"amountInCents"`
	AccountID     uuid.UUID  `json:"accountId"`
	HouseholdID   uuid.UUID  `json:"householdId"`
	SpentOn       time.Time `json:"spentOn"`
}
