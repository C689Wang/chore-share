package models

import (
	"time"

	"github.com/google/uuid"
)

type AccountNotification struct {
	ID             uuid.UUID    `gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	NotificationID uuid.UUID    `gorm:"not null" json:"notificationId"`
	AccountID      uuid.UUID    `gorm:"not null" json:"accountId"`
	HouseholdID    uuid.UUID    `gorm:"not null" json:"householdId"`
	Seen           bool         `gorm:"not null;default:false" json:"seen"`
	Notification   Notification `gorm:"foreignKey:NotificationID" json:"notification"`
	Account        Account      `gorm:"foreignKey:AccountID" json:"account"`
	CreatedAt      time.Time    `gorm:"default: now()" json:"createdAt"`
	Household      Household    `gorm:"foreignKey:HouseholdID" json:"household"`
}
