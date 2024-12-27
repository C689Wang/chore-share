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
	Description   string     `json:"description"`
	AmountInCents int64     `json:"amountInCents"`
	AccountID     uuid.UUID  `json:"accountId"`
	HouseholdID   uuid.UUID  `json:"householdId"`
	SpentAt       time.Time `json:"spentAt"`
}

type TransactionMemberResponse struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"name"`
}

type TransactionSplitResponse struct {
	ID            uuid.UUID          `json:"id"`
	TransactionID uuid.UUID          `json:"transactionId"`
	Description   string             `json:"description"`
	SpentAt       time.Time          `json:"spentAt"`
	OwedByID      uuid.UUID          `json:"owedById"`
	OwedToID      uuid.UUID          `json:"owedToId"`
	AmountInCents int64              `json:"amountInCents"`
	IsSettled     bool               `json:"isSettled"`
	SettledAt     *time.Time         `json:"settledAt"`
	OwedBy        TransactionMemberResponse    `json:"owedBy"`
	OwedTo        TransactionMemberResponse    `json:"owedTo"`
}

type NotificationResponse struct {
	ID           uuid.UUID    `json:"id"`
	Seen         bool         `json:"seen"`
	CreatedAt    time.Time    `json:"createdAt"`
	Action       string       `json:"action"`
	Actor        ActorInfo    `json:"actor"`
	ChoreInfo    *ChoreInfo   `json:"choreInfo,omitempty"`
	ReviewInfo   *ReviewInfo  `json:"reviewInfo,omitempty"`
	Transaction  *TransactionInfo `json:"transactionInfo,omitempty"`
	Split        *SplitInfo 	`json:"splitInfo,omitempty"`
}

type ActorInfo struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type ChoreInfo struct {
	ChoreID        uuid.UUID `json:"choreId"`
	AccountChoreID uuid.UUID `json:"accountChoreId"`
	Title          string    `json:"title"`
	DueDate        time.Time `json:"dueDate"`
}

type ReviewInfo struct {
	ReviewID uuid.UUID `json:"reviewId"`
	Review   string    `json:"review"`
	ChoreName string `json:"choreName"`
	AccountChoreID uuid.UUID `json:"accountChoreId"`
}

type TransactionInfo struct {
	TransactionID uuid.UUID `json:"transactionId"`
	Description   string    `json:"description"`
	AmountInCents int64     `json:"amountInCents"`
}

type SplitInfo struct {
	SplitID uuid.UUID `json:"id"`
	AmountInCents int64 `json:"amountInCents"`
	OwedByID uuid.UUID `json:"owedById"`
	OwedToID uuid.UUID `json:"owedToId"`
	Description string `json:"description"`
	OwedByName string `json:"owedByName"`
	OwedToName string `json:"owedToName"`
}

type ChoreReviewResponse struct {
	ID uuid.UUID `json:"id"`
	ReviewerID uuid.UUID `json:"reviewerId"`
	ReviewerName string `json:"reviewerName"`
	ReviewComment string `json:"reviewComment"`
	ReviewerStatus string `json:"reviewerStatus"`
	CreatedAt time.Time `json:"createdAt"`
}
