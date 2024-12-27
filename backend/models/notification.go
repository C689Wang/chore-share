package models

import (
	"time"

	"github.com/google/uuid"
)

// NotificationAction defines the type of notification
const (
	NotificationActionChoreAssigned    = "CHORE_ASSIGNED"
	NotificationActionChorePending     = "CHORE_PENDING"
	NotificationActionChoreCompleted   = "CHORE_COMPLETED"
	NotificationActionTransactionAdded = "TRANSACTION_ADDED"
	NotificationActionReviewSubmitted  = "REVIEW_SUBMITTED"
	NotificationActionTransactionSettled = "TRANSACTION_SETTLED"
)

type Notification struct {
	ID               uuid.UUID     		`gorm:"primaryKey; type:uuid; default:gen_random_uuid()" json:"id"`
	Action           string        		`json:"action"`
	AccountID        uuid.UUID     		`gorm:"not null" json:"actorAccountId"`
	AccountChoreID   *uuid.UUID   		`json:"accountChoreId"`
	ChoreID          *uuid.UUID   		`json:"assignedChoreId"`
	TransactionID    *uuid.UUID   		`json:"transactionId"`
	ReviewID         *uuid.UUID   		`json:"reviewId"`
	SplitID          *uuid.UUID   		`json:"splitId"`
	HouseholdID      uuid.UUID    		`json:"householdId"`
	Account          Account      		`gorm:"foreignKey:AccountID" json:"actorAccount"`
	AccountChore     AccountChore 		`gorm:"foreignKey:AccountChoreID" json:"accountChore"`
	Chore            Chore         		`gorm:"foreignKey:ChoreID" json:"actorChore"`
	Transaction      Transaction   		`gorm:"foreignKey:TransactionID" json:"transaction"`
	Review           ChoreReview   		`gorm:"foreignKey:ReviewID" json:"review"`
	CreatedAt        time.Time     		`gorm:"default: now()" json:"createdAt"`
	Household        Household     		`gorm:"foreignKey:HouseholdID" json:"household"`
	Split            TransactionSplit 	`gorm:"foreignKey:SplitID" json:"split"`
}
