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
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Completed   bool      `json:"completed"`
	HouseholdID uuid.UUID `json:"householdId"`
	CreatedAt   time.Time `json:"createdAt"`
}

type AccountChoreResponse struct {
	ID        uuid.UUID     `json:"id"`
	ChoreID   uuid.UUID     `json:"choreId"`
	AccountID uuid.UUID     `json:"accountId"`
	DueDate   *time.Time    `json:"dueDate"`
	Completed bool          `json:"completed"`
	Chore     ChoreResponse `json:"chore"`
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