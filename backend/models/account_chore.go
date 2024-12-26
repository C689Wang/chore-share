package models

import (
	"time"

	"github.com/google/uuid"
)

type AssignmentStatus string

const (
	AssignmentStatusPending   AssignmentStatus = "PENDING"   // Current, needs to be done
	AssignmentStatusCompleted AssignmentStatus = "COMPLETED" // Done
	AssignmentStatusOverdue   AssignmentStatus = "OVERDUE"   // Past due date
	AssignmentStatusPlanned   AssignmentStatus = "PLANNED"   // Future assignment in rotation
)

type AccountChore struct {
	ID            uuid.UUID        `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	ChoreID       uuid.UUID        `gorm:"not null" json:"choreId"`
	AccountID     uuid.UUID        `gorm:"not null" json:"accountId"`
	HouseholdID   uuid.UUID        `gorm:"not null" json:"householdId"`
	DueDate       time.Time        `gorm:"not null" json:"dueDate"`
	CompletedAt   *time.Time       `json:"completedAt"`
	Status        AssignmentStatus `gorm:"not null; default:'PENDING'" json:"status"`
	RotationOrder int              `gorm:"not null" json:"rotationOrder"`
	Chore         Chore            `gorm:"foreignKey:ChoreID"`
	Account       Account          `gorm:"foreignKey:AccountID"`
	Household     Household        `gorm:"foreignKey:HouseholdID"`
	Points        int              `gorm:"not null" json:"points"`
}
