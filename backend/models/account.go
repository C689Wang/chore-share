package models

import "time"

type Account struct {
	ID        string    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	GoogleId  string    `gorm:"unique" json:"google_id"`
	Name      string    `gorm:"not null; size:255" json:"name"`
	CreatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null; default:CURRENT_TIMESTAMP" json:"updated_at"`
	HouseholdID *string    `gorm:"type:uuid" json:"household_id"`
	Household   *Household `gorm:"foreignKey:HouseholdID"`
}
