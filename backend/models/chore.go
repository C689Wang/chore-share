package models

import (
	"time"

	"github.com/google/uuid"
)

type ChoreType string
type FrequencyType string

const (
	ChoreTypeOneTime    ChoreType = "ONE_TIME"
	ChoreTypeRecurring  ChoreType = "RECURRING"

	FrequencyTypeDaily    FrequencyType = "DAILY"
	FrequencyTypeWeekly  FrequencyType = "WEEKLY"
)

type Chore struct {
	ID            uuid.UUID    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	Title         string       `gorm:"not null; size:255" json:"title"`
	Description   string       `json:"description"`
	HouseholdID   uuid.UUID    `gorm:"not null" json:"householdId"`
	Type          ChoreType    `gorm:"not null" json:"type"`
	EndDate       time.Time   `json:"endDate"`    
	FrequencyType *FrequencyType `json:"frequencyType"`
	CreatedAt     time.Time    `gorm:"not null; default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time    `gorm:"not null; default:CURRENT_TIMESTAMP" json:"updated_at"`
	Household     Household    `gorm:"foreignKey:HouseholdID" json:"household"`
	Points        int          `gorm:"not null" json:"points"`
}
