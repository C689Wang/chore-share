package models

import (
	"github.com/google/uuid"
)

type ChoreSchedule struct {
	ID        uuid.UUID `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	ChoreID   uuid.UUID `gorm:"not null" json:"choreId"`
	DayOfWeek int       `gorm:"not null" json:"dayOfWeek"` // 1-7 for Monday-Sunday
	Chore     Chore     `gorm:"foreignKey:ChoreID"`
} 