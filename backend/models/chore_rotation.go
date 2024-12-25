package models

import (
	"github.com/google/uuid"
)

type ChoreRotation struct {
	ID            uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ChoreID       uuid.UUID `gorm:"not null" json:"choreId"`
	AccountID     uuid.UUID `gorm:"not null" json:"accountId"`
	HouseholdID   uuid.UUID `gorm:"not null" json:"householdId"`
	RotationOrder int       `gorm:"not null" json:"rotationOrder"`
	Chore         Chore     `gorm:"foreignKey:ChoreID"`
	Account       Account   `gorm:"foreignKey:AccountID"`
	Household     Household `gorm:"foreignKey:HouseholdID"`
} 