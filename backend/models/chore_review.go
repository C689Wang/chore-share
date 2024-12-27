package models

import (
	"time"

	"github.com/google/uuid"
)

type ChoreReview struct {
	ID               uuid.UUID    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	AccountChoreID   uuid.UUID    `gorm:"not null" json:"choreId"`
	ReviewerID       uuid.UUID    `gorm:"not null" json:"reviewerId"`
	AccountChore     AccountChore `gorm:"foreignKey:AccountChoreID" json:"chore"`
	Reviewer         Account      `gorm:"foreignKey:ReviewerID" json:"reviewer"`
	Review           string       `gorm:"not null" json:"review"`
	CreatedAt        time.Time    `gorm:"default: now()" json:"createdAt"`
}
