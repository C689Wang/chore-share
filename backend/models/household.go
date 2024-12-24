package models

import (
	"time"

	"github.com/google/uuid"
)

type Household struct {
	ID        uuid.UUID    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	Password  string    `gorm:"not null; size:255" json:"password"`
	Name      string    `gorm:"not null; size:255" json:"name"`
	CreatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"updated_at"`
	Members   []Account `gorm:"many2many:account_households;"`
}
