package models

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	HouseholdID   uuid.UUID
	PaidByID      uuid.UUID      // Who paid for the expense
	AmountInCents int64          // Store in cents to avoid floating point issues
	Description   string
	SpentAt       time.Time      // When the expense occurred
	CreatedAt     time.Time
	// Add any other transaction metadata
}

type TransactionSplit struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TransactionID uuid.UUID
	OwedByID      uuid.UUID      // Who needs to pay back
	OwedToID      uuid.UUID      // Who paid (same as Transaction.PaidByID)
	AmountInCents int64          // Their share of the split
	IsSettled     bool           // Whether this split has been paid back
	SettledAt     *time.Time
	Transaction   Transaction    `gorm:"foreignKey:TransactionID"`
}

type TransactionSummary struct {
	Month        time.Time                // The month this summary is for
	TotalOwed    int64                    // Total amount others owe you
	TotalOwing   int64                    // Total amount you owe others
	OwedDetails  []TransactionOwedDetail  // Breakdown of who owes you what
	OwingDetails []TransactionOwingDetail // Breakdown of what you owe to whom
}

type TransactionOwedDetail struct {
	OwedByID      uuid.UUID
	OwedByName    string
	AmountInCents int64
	Splits        []TransactionSplit
}

type TransactionOwingDetail struct {
	OwedToID      uuid.UUID
	OwedToName    string
	AmountInCents int64
	Splits        []TransactionSplit
}
