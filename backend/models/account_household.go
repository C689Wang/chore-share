package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountHousehold struct {
	AccountID  uuid.UUID `gorm:"type:uuid;primary_key"`
	HouseholdID uuid.UUID `gorm:"type:uuid;primary_key"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Account     Account   `gorm:"foreignKey:AccountID"`
	Household   Household `gorm:"foreignKey:HouseholdID"`
} 