package models

import (
	"time"

	"github.com/google/uuid"
)

type Account struct {
	ID        uuid.UUID    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	GoogleId  string    `gorm:"unique" json:"google_id"`
	Name      string    `gorm:"not null; size:255" json:"name"`
	CreatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"updated_at"`
	Households  []Household `gorm:"many2many:account_households;"`
}
