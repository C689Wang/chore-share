package models

import (
	"time"

	"github.com/google/uuid"
)

type Chore struct {
	ID        uuid.UUID `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	Title     string `gorm:"not null; size:255" json:"title"`
	Completed bool   `gorm:"not null; default:false" json:"completed"`
	CreatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"updated_at"`
}

