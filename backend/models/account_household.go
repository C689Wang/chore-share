package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountHousehold struct {
	ID         uuid.UUID `gorm:"primaryKey; default:gen_random_uuid()" json:"id"`
	AccountID  uuid.UUID `gorm:"type:uuid;primary_key"`
	HouseholdID uuid.UUID `gorm:"type:uuid;primary_key"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Account     Account   `gorm:"foreignKey:AccountID"`
	Household   Household `gorm:"foreignKey:HouseholdID"`
	Points      uint       `gorm:"default:0"`
}
