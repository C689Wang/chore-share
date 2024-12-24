package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountChore struct {
	ID        uuid.UUID `gorm:"primaryKey; default:gen_random_uuid()" json:"id"`
	ChoreID   uuid.UUID `gorm:"not null" json:"choreId"`
	AccountID uuid.UUID `gorm:"not null" json:"accountId"`
	DueDate   time.Time `gorm:"type:date" json:"dueDate"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Chore     Chore     `json:"chore"`
	Account   Account   `json:"account"`
	Completed bool      `json:"completed"`
}