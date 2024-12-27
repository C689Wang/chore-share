package models

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	HouseholdID   uuid.UUID `gorm:"type:uuid;not null"`
	PaidByID      uuid.UUID `gorm:"type:uuid;not null"`
	AmountInCents int64     `gorm:"not null"`
	Description   string    `gorm:"not null"`
	SpentAt       time.Time `gorm:"not null"`
	CreatedAt     time.Time `gorm:"not null"`
	// Add any other transaction metadata
}

type TransactionSplit struct {
	ID            uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TransactionID uuid.UUID   `gorm:"type:uuid;not null"`
	OwedByID      uuid.UUID   `gorm:"type:uuid;not null"`
	OwedToID      uuid.UUID   `gorm:"type:uuid;not null"`
	AmountInCents int64       `gorm:"not null"`
	IsSettled     bool        `gorm:"not null;default:false"`
	SettledAt     *time.Time
	Transaction   Transaction    `gorm:"foreignKey:TransactionID"`
	OwedBy        Account        `gorm:"foreignKey:OwedByID"`
	OwedTo        Account        `gorm:"foreignKey:OwedToID"`
}

type TransactionSummary struct {
	Month        time.Time                  `json:"month"`
	TotalOwed    int64                      `json:"totalOwed"`
	TotalOwing   int64                      `json:"totalOwing"`
	OwedDetails  []TransactionOwedDetail    `json:"owedDetails"`
	OwingDetails []TransactionOwingDetail  	`json:"owingDetails"`
}

type TransactionOwedDetail struct {
	OwedByID      uuid.UUID                  `json:"owedById"`
	OwedByName    string                     `json:"owedByName"`
	AmountInCents int64                      `json:"amountInCents"`
	Splits        []TransactionSplitResponse `json:"splits"`
}

type TransactionOwingDetail struct {
	OwedToID      uuid.UUID                  `json:"owedToId"`
	OwedToName    string                     `json:"owedToName"`
	AmountInCents int64                      `json:"amountInCents"`
	Splits        []TransactionSplitResponse `json:"splits"`
}
