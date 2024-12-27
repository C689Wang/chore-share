package service

import (
	"chore-share/models"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBService interface {
	CreateAccount(account *models.Account) (models.AccountResponse, error)
	CreateChore(chore *models.Chore, assignees []uuid.UUID, schedule []models.ChoreSchedule) error
	GetAccount(accountId uuid.UUID) (models.AccountResponse, error)
	GetAccountByGoogleId(googleId string) (models.AccountResponse, error)
	CreateHousehold(household *models.Household) error
	JoinHousehold(householdId uuid.UUID, accountId uuid.UUID, password string) error
	GetAccountHouseholds(accountId uuid.UUID) ([]models.HouseholdResponse, error)
	GetAccountChores(accountId uuid.UUID, householdId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdChores(householdId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdLeaderboard(householdId uuid.UUID) ([]models.LeaderboardEntryResponse, error)
	GetHouseholdMembers(householdId uuid.UUID) ([]models.HouseholdMemberResponse, error)
	CompleteChore(accountChoreId uuid.UUID) error
	CreateTransaction(transaction *models.Transaction) error
	GetTransactionSummary(accountID, householdID uuid.UUID, month time.Time) (models.TransactionSummary, error)
	SettleTransactionSplit(splitID uuid.UUID) error
	CreateNotification(notification *models.Notification, recipientIDs []uuid.UUID, householdID uuid.UUID) error
	GetAccountNotifications(accountID uuid.UUID, householdID uuid.UUID) ([]models.NotificationResponse, error)
	MarkNotificationAsSeen(accountID uuid.UUID, notificationID uuid.UUID) error
	CreateChoreReview(review *models.ChoreReview) error
	GetChoreReview(reviewID uuid.UUID) (models.ChoreReviewResponse, error)
	MarkNotificationsAsSeen(accountID uuid.UUID, notificationIDs []uuid.UUID) error
}

type dbService struct {
	db *gorm.DB
}

func NewDBService(connUrl string) DBService {
	db, err := gorm.Open(postgres.Open(connUrl), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(
		&models.Account{},
		&models.Chore{},
		&models.Household{},
		&models.AccountHousehold{},
		&models.AccountChore{},
		&models.ChoreSchedule{},
		&models.ChoreRotation{},
		&models.Transaction{},
		&models.TransactionSplit{},
		&models.Notification{},
		&models.AccountNotification{},
		&models.ChoreReview{},
	)
	return &dbService{db: db}
}

func (s *dbService) CreateAccount(account *models.Account) (models.AccountResponse, error) {
	if err := s.db.Create(account).Error; err != nil {
		return models.AccountResponse{}, err
	}
	return models.AccountResponse{
		ID:       account.ID,
		Name:     account.Name,
		GoogleId: account.GoogleId,
	}, nil
}

func (s *dbService) GetAccountByGoogleId(googleId string) (models.AccountResponse, error) {
	var account models.Account
	err := s.db.Where("google_id = ?", googleId).First(&account).Error
	if err != nil {
		return models.AccountResponse{}, err
	}
	return models.AccountResponse{
		ID:       account.ID,
		Name:     account.Name,
		GoogleId: account.GoogleId,
	}, nil
}

func (s *dbService) GetAccount(accountId uuid.UUID) (models.AccountResponse, error) {
	var account models.Account
	err := s.db.First(&account, accountId).Error
	if err != nil {
		return models.AccountResponse{}, err
	}
	return models.AccountResponse{
		ID:       account.ID,
		Name:     account.Name,
		GoogleId: account.GoogleId,
	}, nil
}

func (s *dbService) CreateChore(chore *models.Chore, assignees []uuid.UUID, schedule []models.ChoreSchedule) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Create the chore
	if err := tx.Create(chore).Error; err != nil {
		tx.Rollback()
		return err
	}

	var accountChoreID *uuid.UUID
	
	switch chore.Type {
	case models.ChoreTypeOneTime:
		// For one-time chores, create single AccountChore
		if len(assignees) > 0 {
			accountChore := models.AccountChore{
				ChoreID:     chore.ID,
				AccountID:   assignees[0],
				HouseholdID: chore.HouseholdID,
				DueDate:     chore.EndDate,
				Status:      models.AssignmentStatusPending,
				Points:      chore.Points,
			}
			if err := tx.Create(&accountChore).Error; err != nil {
				tx.Rollback()
				return err
			}
			accountChoreID = &accountChore.ID
		}

	case models.ChoreTypeRecurring:
		// Create rotation entries for recurring chores
		for i, accountID := range assignees {
			rotation := models.ChoreRotation{
				ChoreID:       chore.ID,
				AccountID:     accountID,
				HouseholdID:   chore.HouseholdID,
				RotationOrder: i,
			}
			if err := tx.Create(&rotation).Error; err != nil {
				tx.Rollback()
				return err
			}
		}

		// Create schedule entries
		for _, sched := range schedule {
			sched.ChoreID = chore.ID
			if err := tx.Create(&sched).Error; err != nil {
				tx.Rollback()
				return err
			}
		}

		// Generate initial assignments and get first assignment ID
		firstAssignmentID, err := s.generateInitialAssignments(tx, chore, assignees)
		if err != nil {
			tx.Rollback()
			return err
		}
		accountChoreID = firstAssignmentID
	}

	// Commit the transaction first
	if err := tx.Commit().Error; err != nil {
		return err
	}

	// Now create notification in a separate transaction
	notification := &models.Notification{
		Action:         models.NotificationActionChoreAssigned,
		AccountID:      assignees[0],
		ChoreID:        &chore.ID,
		AccountChoreID: accountChoreID,
	}

	// Get household members for notifications
	var householdMembers []uuid.UUID
	if err := s.db.Model(&models.AccountHousehold{}).
		Where("household_id = ?", chore.HouseholdID).
		Pluck("account_id", &householdMembers).Error; err != nil {
		return err
	}

	if err := s.CreateNotification(notification, householdMembers, chore.HouseholdID); err != nil {
		return err
	}

	return nil
}

func (s *dbService) generateInitialAssignments(tx *gorm.DB, chore *models.Chore, assignees []uuid.UUID) (*uuid.UUID, error) {
	// Get the schedule
	var schedules []models.ChoreSchedule
	if err := tx.Where("chore_id = ?", chore.ID).Find(&schedules).Error; err != nil {
		return nil, err
	}

	// Generate assignments for next week only
	startDate := time.Now()
	endDate := startDate.AddDate(0, 0, 7)
	assigneeIndex := 0
	isFirstAssignment := true

	var firstAssignmentID *uuid.UUID

	for date := startDate; date.Before(endDate); date = date.AddDate(0, 0, 1) {
		weekday := int(date.Weekday())
		if weekday == 0 {
			weekday = 7
		}

		// Check if this day is in schedule
		for _, sched := range schedules {
			if sched.DayOfWeek == weekday {
				// Set due date to end of the selected day (23:59:59)
				dueDate := time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, date.Location())

				accountChoreId := uuid.New()
				// First assignment is PENDING, rest are PLANNED
				status := models.AssignmentStatusPlanned
				if isFirstAssignment {
					firstAssignmentID = &accountChoreId
					status = models.AssignmentStatusPending
					isFirstAssignment = false
				}

				accountChore := models.AccountChore{
					ID:           accountChoreId,
					ChoreID:       chore.ID,
					AccountID:     assignees[assigneeIndex],
					HouseholdID:   chore.HouseholdID,
					DueDate:       dueDate,
					Status:        status,
					RotationOrder: assigneeIndex,
					Points:        chore.Points,
				}

				if err := tx.Create(&accountChore).Error; err != nil {
					return nil, err
				}

				assigneeIndex = (assigneeIndex + 1) % len(assignees)
			}
		}
	}

	return firstAssignmentID, nil
}


func (s *dbService) CreateHousehold(household *models.Household) error {
	// Generate hash
	hash, err := bcrypt.GenerateFromPassword([]byte(household.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	
	// Set the hashed password
	household.Password = string(hash)
	
	return s.db.Create(household).Error
}

func (s *dbService) JoinHousehold(householdId uuid.UUID, accountId uuid.UUID, password string) error {
	// Find household
	var household models.Household
	if err := s.db.First(&household, householdId).Error; err != nil {
		return err
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(household.Password), []byte(password)); err != nil {
		return errors.New("invalid password")
	}

	// Create association
	result := s.db.Create(&models.AccountHousehold{
		AccountID: accountId,
		HouseholdID: householdId,
	})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

func (s *dbService) GetAccountHouseholds(accountId uuid.UUID) ([]models.HouseholdResponse, error) {
	var households []models.Household
	err := s.db.Model(&models.Account{ID: accountId}).
		Association("Households").
		Find(&households)
	if err != nil {
		return nil, err
	}

	response := make([]models.HouseholdResponse, len(households))
	for i, h := range households {
		response[i] = models.HouseholdResponse{
			ID:   h.ID,
			Name: h.Name,
		}
	}
	return response, nil
}

func (s *dbService) GetAccountChores(accountId uuid.UUID, householdId uuid.UUID) ([]models.AccountChoreResponse, error) {
	var accountChores []models.AccountChore
	
	// Get current month's start and end dates
	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	currentMonthEnd := currentMonthStart.AddDate(0, 1, 0).Add(-time.Second)

	// Query for both pending and completed chores
	err := s.db.Preload("Chore").Preload("Account").
		Where("account_id = ? AND household_id = ?", accountId, householdId).
		Where("(status = ? OR status = ? OR (status = ? AND completed_at BETWEEN ? AND ?))",
			models.AssignmentStatusPending,
			models.AssignmentStatusPlanned,
			models.AssignmentStatusCompleted,
			currentMonthStart,
			currentMonthEnd).
		Order("due_date ASC").
		Find(&accountChores).Error

	if err != nil {
		return nil, err
	}

	response := make([]models.AccountChoreResponse, len(accountChores))
	for i, ac := range accountChores {
		response[i] = models.AccountChoreResponse{
			ID:          ac.ID,
			ChoreID:     ac.ChoreID,
			AccountID:   ac.AccountID,
			AccountName: ac.Account.Name,
			DueDate:     ac.DueDate,
			Status:      ac.Status,
			CompletedAt: ac.CompletedAt,
			Points:      ac.Points,
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Description: ac.Chore.Description,
				Type:        ac.Chore.Type,
				HouseholdID: ac.Chore.HouseholdID,
				CreatedAt:   ac.Chore.CreatedAt,
			},
		}
	}
	return response, nil
}

func (s *dbService) GetHouseholdChores(householdId uuid.UUID) ([]models.AccountChoreResponse, error) {
	var accountChores []models.AccountChore
	
	// Get time range: now to next week
	now := time.Now()
	nextWeek := now.AddDate(0, 0, 7)

	err := s.db.Preload("Chore").
		Preload("Account").
		Joins("JOIN chores ON chores.id = account_chores.chore_id").
		Where("account_chores.household_id = ?", householdId).
		Where("(status = ? OR status = ?) AND due_date BETWEEN ? AND ?",
			models.AssignmentStatusPending,
			models.AssignmentStatusCompleted,
			now, nextWeek).
		Order("due_date ASC").
		Find(&accountChores).Error
	if err != nil {
		return nil, err
	}

	response := make([]models.AccountChoreResponse, len(accountChores))
	for i, ac := range accountChores {
		response[i] = models.AccountChoreResponse{
			ID:          ac.ID,
			ChoreID:     ac.ChoreID,
			AccountID:   ac.AccountID,
			AccountName: ac.Account.Name,
			DueDate:     ac.DueDate,
			Status:      ac.Status,
			CompletedAt: ac.CompletedAt,
			Points:      ac.Points,
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Description: ac.Chore.Description,
				Type:        ac.Chore.Type,
				HouseholdID: ac.Chore.HouseholdID,
				CreatedAt:   ac.Chore.CreatedAt,
			},
		}
	}
	return response, nil
}

func (s *dbService) GetHouseholdLeaderboard(householdId uuid.UUID) ([]models.LeaderboardEntryResponse, error) {
	var entries []struct {
		AccountID   uuid.UUID
		AccountName string
		TotalPoints uint
	}

	// Get current month's start and end dates
	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	currentMonthEnd := currentMonthStart.AddDate(0, 1, 0).Add(-time.Second)

	err := s.db.Table("account_chores").
		Select("account_chores.account_id, accounts.name as account_name, COALESCE(SUM(account_chores.points), 0) as total_points").
		Joins("JOIN accounts ON accounts.id = account_chores.account_id").
		Where("account_chores.household_id = ? AND account_chores.status = ? AND account_chores.completed_at BETWEEN ? AND ?",
			householdId,
			models.AssignmentStatusCompleted,
			currentMonthStart,
			currentMonthEnd).
		Group("account_chores.account_id, accounts.name").
		Order("total_points DESC").
		Scan(&entries).Error
	
	if err != nil {
		return nil, err
	}

	response := make([]models.LeaderboardEntryResponse, len(entries))
	for i, entry := range entries {
		response[i] = models.LeaderboardEntryResponse{
			AccountID:   entry.AccountID,
			AccountName: entry.AccountName,
			Points:      entry.TotalPoints,
		}
	}
	return response, nil
}

func (s *dbService) GetHouseholdMembers(householdId uuid.UUID) ([]models.HouseholdMemberResponse, error) {
	var members []models.Account
	err := s.db.Model(&models.Household{ID: householdId}).
		Association("Members").
		Find(&members)
	if err != nil {
		return nil, err
	}

	response := make([]models.HouseholdMemberResponse, len(members))
	for i, m := range members {
		response[i] = models.HouseholdMemberResponse{
			ID:   m.ID,
			Name: m.Name,
		}
	}
	return response, nil
}

func (s *dbService) CompleteChore(accountChoreId uuid.UUID) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Get the account chore with related data
	var accountChore models.AccountChore
	if err := tx.Preload("Account").Preload("Chore").
		Where("id = ? AND status = ?", accountChoreId, models.AssignmentStatusPending).
		First(&accountChore).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Get household members for notification
	var householdMembers []uuid.UUID
	if err := tx.Model(&models.AccountHousehold{}).
		Where("household_id = ?", accountChore.HouseholdID).
		Pluck("account_id", &householdMembers).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create completion notification
	notification := &models.Notification{
		Action:         models.NotificationActionChoreCompleted,
		AccountID:      accountChore.AccountID,
		ChoreID:        &accountChore.ChoreID,
		AccountChoreID: &accountChore.ID,
	}

	if err := s.CreateNotification(notification, householdMembers, accountChore.HouseholdID); err != nil {
		tx.Rollback()
		return err
	}

	now := time.Now()
	accountChore.Status = models.AssignmentStatusCompleted
	accountChore.CompletedAt = &now

	if err := tx.Save(&accountChore).Error; err != nil {
		tx.Rollback()
		return err
	}

	if accountChore.Chore.Type == models.ChoreTypeRecurring {
		// Handle recurring chore logic
		nextPendingID, err := s.handleRecurringChoreCompletion(tx, &accountChore.Chore, &accountChore)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Create notification for next pending assignment if one exists
		if nextPendingID != nil {
			notification := &models.Notification{
				Action:         models.NotificationActionChoreAssigned,
				AccountID:      accountChore.AccountID,
				ChoreID:        &accountChore.ChoreID,
				AccountChoreID: nextPendingID,
			}

			if err := s.CreateNotification(notification, householdMembers, accountChore.HouseholdID); err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	return tx.Commit().Error
}

func (s *dbService) handleRecurringChoreCompletion(tx *gorm.DB, chore *models.Chore, completedChore *models.AccountChore) (*uuid.UUID, error) {
	// Get the rotation for this chore
	var rotations []models.ChoreRotation
	if err := tx.Where("chore_id = ?", chore.ID).Order("rotation_order").Find(&rotations).Error; err != nil {
		return nil, err
	}

	// Get the schedule
	var schedules []models.ChoreSchedule
	if err := tx.Where("chore_id = ?", chore.ID).Find(&schedules).Error; err != nil {
		return nil, err
	}

	// Get the next occurrence date based on completion time
	nextDate := s.calculateNextOccurrence(*completedChore.CompletedAt)

	// Count assignments between completion and next date
	var assignmentCount int64
	if err := tx.Model(&models.AccountChore{}).
		Where("chore_id = ? AND due_date > ? AND due_date < ? AND status IN (?)",
			chore.ID,
			completedChore.CompletedAt,
			nextDate,
			[]models.AssignmentStatus{models.AssignmentStatusPending, models.AssignmentStatusPlanned}).
		Count(&assignmentCount).Error; err != nil {
		return nil, err
	}

	// Calculate next rotation order based on completed assignment and intervening assignments
	nextRotationOrder := (completedChore.RotationOrder + 1 + int(assignmentCount)) % len(rotations)
	nextAssignee := rotations[nextRotationOrder].AccountID

	// Create the next week's assignment
	var nextWeekAssignment models.AccountChore
	err := tx.Where("chore_id = ? AND due_date = ? AND status IN (?)",
		chore.ID, nextDate, []models.AssignmentStatus{models.AssignmentStatusPending, models.AssignmentStatusPlanned}).
		First(&nextWeekAssignment).Error

	if err == gorm.ErrRecordNotFound {
		nextWeekAssignment = models.AccountChore{
			ChoreID:       chore.ID,
			AccountID:     nextAssignee,
			HouseholdID:   chore.HouseholdID,
			DueDate:       nextDate,
			Status:        models.AssignmentStatusPlanned,
			RotationOrder: nextRotationOrder,
			Points:        chore.Points,
		}
		if err := tx.Create(&nextWeekAssignment).Error; err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}

	// Find and update the next immediate assignment to pending
	var nextImmediateAssignment models.AccountChore
	err = tx.Where("chore_id = ? AND due_date > ? AND status = ?",
		chore.ID, completedChore.CompletedAt, models.AssignmentStatusPlanned).
		Order("due_date").First(&nextImmediateAssignment).Error

	var nextPendingID *uuid.UUID
	if err == nil {
		nextImmediateAssignment.Status = models.AssignmentStatusPending
		if err := tx.Save(&nextImmediateAssignment).Error; err != nil {
			return nil, err
		}
		nextPendingID = &nextImmediateAssignment.ID
	} else if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// If completed late, update all future assignments' due dates
	if completedChore.CompletedAt.After(completedChore.DueDate) {
		if err := s.updateFutureAssignments(tx, chore, completedChore, schedules); err != nil {
			return nil, err
		}
	}

	return nextPendingID, nil
}

func (s *dbService) calculateNextOccurrence(lastDueDate time.Time) time.Time {	
	// Add 7 days to get to the same weekday next week
	nextDate := lastDueDate.AddDate(0, 0, 7)
	
	// Return the date with time set to end of day
	return time.Date(nextDate.Year(), nextDate.Month(), nextDate.Day(), 23, 59, 59, 0, nextDate.Location())
}

func (s *dbService) updateFutureAssignments(tx *gorm.DB, chore *models.Chore, completedChore *models.AccountChore, schedules []models.ChoreSchedule) error {
	var futureAssignments []models.AccountChore
	if err := tx.Where("chore_id = ? AND due_date > ? AND status IN (?)",
		chore.ID, completedChore.DueDate, []models.AssignmentStatus{models.AssignmentStatusPending, models.AssignmentStatusPlanned}).
		Order("due_date").Find(&futureAssignments).Error; err != nil {
		return err
	}

	// Calculate the new base date for the schedule
	nextDate := s.calculateNextOccurrence(*completedChore.CompletedAt)

	// First assignment should be pending, rest remain planned
	for i, assignment := range futureAssignments {
		assignment.DueDate = nextDate
		if i == 0 {
			assignment.Status = models.AssignmentStatusPending
		}
		if err := tx.Save(&assignment).Error; err != nil {
			return err
		}
		// Calculate next date for subsequent assignments
		nextDate = s.calculateNextOccurrence(nextDate)
	}

	return nil
}

func (s *dbService) CreateTransaction(transaction *models.Transaction) error {
	tx := s.db.Begin()
	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Get household members for notification
	var householdMembers []uuid.UUID
	if err := tx.Model(&models.AccountHousehold{}).
		Where("household_id = ?", transaction.HouseholdID).
		Pluck("account_id", &householdMembers).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Calculate split amount (including the payer)
	splitCount := len(householdMembers)
	if splitCount == 0 {
		tx.Rollback()
		return errors.New("no other members to split with")
	}
	
	amountPerPerson := transaction.AmountInCents / int64(splitCount)

	// Create splits for each member except the payer
	for _, member := range householdMembers {
		if member == transaction.PaidByID {
			continue
		}

		split := models.TransactionSplit{
			TransactionID: transaction.ID,
			OwedByID:     member,
			OwedToID:     transaction.PaidByID,
			AmountInCents: amountPerPerson,  // Each person owes their share
			IsSettled:    false,
		}

		if err := tx.Create(&split).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	// Create transaction notification
	notification := &models.Notification{
		Action:        models.NotificationActionTransactionAdded,
		AccountID:     transaction.PaidByID,
		TransactionID: &transaction.ID,
	}
	
	if err := s.CreateNotification(notification, householdMembers, transaction.HouseholdID); err != nil {
		return err
	}

	return nil
}

func (s *dbService) GetTransactionSummary(accountID uuid.UUID, householdID uuid.UUID, month time.Time) (models.TransactionSummary, error) {
	startOfMonth := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)
	
	var summary models.TransactionSummary
	summary.Month = month
	summary.OwedDetails = []models.TransactionOwedDetail{}
	summary.OwingDetails = []models.TransactionOwingDetail{}
	summary.TotalOwed = 0
	summary.TotalOwing = 0

	// Get all splits for the user (both owed and owing)
	var splits []models.TransactionSplit
	err := s.db.Where("(owed_by_id = ? OR owed_to_id = ?) AND transaction_id IN (?)",
		accountID, accountID,
		s.db.Model(&models.Transaction{}).
			Select("id").
			Where("household_id = ? AND spent_at BETWEEN ? AND ?",
				householdID, startOfMonth, endOfMonth)).
		Preload("Transaction").
		Preload("OwedBy").
		Preload("OwedTo").
		Find(&splits).Error
	if err != nil {
		return summary, err
	}

	// Process splits into summary
	for _, split := range splits {
		if split.OwedToID == accountID && !split.IsSettled {
			summary.TotalOwed += split.AmountInCents
			found := false
			for i, detail := range summary.OwedDetails {
				if detail.OwedByID == split.OwedByID {
					summary.OwedDetails[i].AmountInCents += split.AmountInCents
					summary.OwedDetails[i].Splits = append(summary.OwedDetails[i].Splits, models.TransactionSplitResponse{
						ID:            split.ID,
						TransactionID: split.TransactionID,
						Description:   split.Transaction.Description,
						SpentAt:      split.Transaction.SpentAt,
						OwedByID:      split.OwedByID,
						OwedToID:      split.OwedToID,
						AmountInCents: split.AmountInCents,
						IsSettled:     split.IsSettled,
						SettledAt:     split.SettledAt,
						OwedBy: models.TransactionMemberResponse{
							ID:   split.OwedBy.ID,
							Name: split.OwedBy.Name,
						},
						OwedTo: models.TransactionMemberResponse{
							ID:   split.OwedTo.ID,
							Name: split.OwedTo.Name,
						},
					})
					found = true
					break
				}
			}
			if !found {
				summary.OwedDetails = append(summary.OwedDetails, models.TransactionOwedDetail{
					OwedByID:      split.OwedByID,
					OwedByName:    split.OwedBy.Name,
					AmountInCents: split.AmountInCents,
					Splits: []models.TransactionSplitResponse{{
						ID:            split.ID,
						TransactionID: split.TransactionID,
						Description:   split.Transaction.Description,
						SpentAt:      split.Transaction.SpentAt,
						OwedByID:      split.OwedByID,
						OwedToID:      split.OwedToID,
						AmountInCents: split.AmountInCents,
						IsSettled:     split.IsSettled,
						SettledAt:     split.SettledAt,
						OwedBy: models.TransactionMemberResponse{
							ID:   split.OwedBy.ID,
							Name: split.OwedBy.Name,
						},
						OwedTo: models.TransactionMemberResponse{
							ID:   split.OwedTo.ID,
							Name: split.OwedTo.Name,
						},
					}},
				})
			}
		} else if split.OwedByID == accountID && !split.IsSettled {
			summary.TotalOwing += split.AmountInCents
			found := false
			for i, detail := range summary.OwingDetails {
				if detail.OwedToID == split.OwedToID {
					summary.OwingDetails[i].AmountInCents += split.AmountInCents
					summary.OwingDetails[i].Splits = append(summary.OwingDetails[i].Splits, models.TransactionSplitResponse{
						ID:            split.ID,
						TransactionID: split.TransactionID,
						Description:   split.Transaction.Description,
						SpentAt:      split.Transaction.SpentAt,
						OwedByID:      split.OwedByID,
						OwedToID:      split.OwedToID,
						AmountInCents: split.AmountInCents,
						IsSettled:     split.IsSettled,
						SettledAt:     split.SettledAt,
						OwedBy: models.TransactionMemberResponse{
							ID:   split.OwedBy.ID,
							Name: split.OwedBy.Name,
						},
						OwedTo: models.TransactionMemberResponse{
							ID:   split.OwedTo.ID,
							Name: split.OwedTo.Name,
						},
					})
					found = true
					break
				}
			}
			if !found {
				summary.OwingDetails = append(summary.OwingDetails, models.TransactionOwingDetail{
					OwedToID:      split.OwedToID,
					OwedToName:    split.OwedTo.Name,
					AmountInCents: split.AmountInCents,
					Splits: []models.TransactionSplitResponse{{
						ID:            split.ID,
						TransactionID: split.TransactionID,
						Description:   split.Transaction.Description,
						SpentAt:      split.Transaction.SpentAt,
						OwedByID:      split.OwedByID,
						OwedToID:      split.OwedToID,
						AmountInCents: split.AmountInCents,
							IsSettled:     split.IsSettled,
							SettledAt:     split.SettledAt,
							OwedBy: models.TransactionMemberResponse{
								ID:   split.OwedBy.ID,
								Name: split.OwedBy.Name,
							},
							OwedTo: models.TransactionMemberResponse{
								ID:   split.OwedTo.ID,
								Name: split.OwedTo.Name,
							},
					}},
				})
			}
		}
	}

	return summary, nil
}

func (s *dbService) SettleTransactionSplit(splitID uuid.UUID) error {
	tx := s.db.Begin()
	
	var split models.TransactionSplit
	if err := tx.Preload("Transaction").
		Where("id = ?", splitID).First(&split).Error; err != nil {
		tx.Rollback()
		return err
	}

	split.IsSettled = true
	now := time.Now()
	split.SettledAt = &now

	if err := tx.Save(&split).Error; err != nil {
		tx.Rollback()
		return err
	}

	var householdMembers []uuid.UUID
	if err := tx.Model(&models.AccountHousehold{}).
		Where("household_id = ?", split.Transaction.HouseholdID).
		Pluck("account_id", &householdMembers).Error; err != nil {
		tx.Rollback()
		return err
	}

	notification := &models.Notification{
		Action:        models.NotificationActionTransactionSettled,
		AccountID:     split.OwedToID,
		TransactionID: &split.TransactionID,
		SplitID:       &split.ID,
	}

	if err := s.CreateNotification(notification, householdMembers, split.Transaction.HouseholdID); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *dbService) CreateNotification(notification *models.Notification, recipientIDs []uuid.UUID, householdID uuid.UUID) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	notification.HouseholdID = householdID

	if err := tx.Create(notification).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create AccountNotification for each recipient
	for _, recipientID := range recipientIDs {
		accountNotification := models.AccountNotification{
			NotificationID: notification.ID,
			AccountID:     recipientID,
			HouseholdID:   householdID,
			Seen:          false,
		}
		if err := tx.Create(&accountNotification).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *dbService) GetAccountNotifications(accountID uuid.UUID, householdID uuid.UUID) ([]models.NotificationResponse, error) {
	var accountNotifications []models.AccountNotification
	err := s.db.Where("account_id = ? AND household_id = ?", accountID, householdID).
		Preload("Notification.Account").
		Preload("Notification.AccountChore.Chore").
		Preload("Notification.Transaction").
		Preload("Notification.Review").
		Preload("Notification.Split").
		Preload("Notification.Split.OwedBy").
		Preload("Notification.Split.OwedTo").
		Order("created_at DESC").
		Find(&accountNotifications).Error
	if err != nil {
		return nil, err
	}

	response := make([]models.NotificationResponse, len(accountNotifications))
	for i, an := range accountNotifications {
		notif := an.Notification
		response[i] = models.NotificationResponse{
			ID:        an.ID,
			Seen:      an.Seen,
			CreatedAt: an.CreatedAt,
			Action:    notif.Action,
			Actor: models.ActorInfo{
				ID:   notif.Account.ID,
				Name: notif.Account.Name,
			},
		}

		// Add type-specific information
		switch notif.Action {
		case models.NotificationActionChoreAssigned, 
			 models.NotificationActionChorePending,
			 models.NotificationActionChoreCompleted:
			if notif.AccountChore.ID != uuid.Nil {
				response[i].ChoreInfo = &models.ChoreInfo{
					ChoreID:        notif.AccountChore.ChoreID,
					AccountChoreID: notif.AccountChore.ID,
					Title:          notif.AccountChore.Chore.Title,
					DueDate:        notif.AccountChore.DueDate,
				}
			}
		case models.NotificationActionReviewSubmitted:
			if notif.Review.ID != uuid.Nil {
				response[i].ReviewInfo = &models.ReviewInfo{
					ReviewID: notif.Review.ID,
					Review:   notif.Review.Review,
					ChoreName: notif.AccountChore.Chore.Title,
					AccountChoreID: notif.AccountChore.ID,
				}
			}
		case models.NotificationActionTransactionAdded:
			if notif.Transaction.ID != uuid.Nil {
				response[i].Transaction = &models.TransactionInfo{
					TransactionID:  notif.Transaction.ID,
					Description:    notif.Transaction.Description,
					AmountInCents: notif.Transaction.AmountInCents,
				}
			}
		case models.NotificationActionTransactionSettled:
			if notif.Split.ID != uuid.Nil {
				response[i].Split = &models.SplitInfo{
					SplitID: notif.Split.ID,
					AmountInCents: notif.Split.AmountInCents,
					OwedByID: notif.Split.OwedByID,
					OwedToID: notif.Split.OwedToID,
					Description: notif.Transaction.Description,
					OwedByName: notif.Split.OwedBy.Name,
					OwedToName: notif.Split.OwedTo.Name,
				}
			}
		}
	}
	return response, nil
}

func (s *dbService) MarkNotificationAsSeen(accountID uuid.UUID, notificationID uuid.UUID) error {
	return s.db.Model(&models.AccountNotification{}).
		Where("account_id = ? AND notification_id = ?", accountID, notificationID).
		Update("seen", true).Error
}

func (s *dbService) CreateChoreReview(review *models.ChoreReview) error {
	err := s.db.Create(review).Error
	if err != nil {
		return err
	}

	var householdMembers []uuid.UUID
	if err := s.db.Model(&models.AccountHousehold{}).
		Where("household_id = ?", review.HouseholdID).
		Pluck("account_id", &householdMembers).Error; err != nil {
		return err
	}

	notification := models.Notification{
		Action:        models.NotificationActionReviewSubmitted,
		AccountID:     review.ReviewerID,
		AccountChoreID: &review.AccountChoreID,
		ReviewID:      &review.ID,
		HouseholdID:   review.HouseholdID,
	}

	err = s.CreateNotification(&notification, householdMembers, review.HouseholdID)
	if err != nil {
		return err
	}

	return nil
}

func (s *dbService) GetChoreReview(reviewID uuid.UUID) (models.ChoreReviewResponse, error) {
	var review models.ChoreReview
	err := s.db.Where("id = ?", reviewID).
		Preload("Reviewer").
		First(&review).Error
	if err != nil {
		return models.ChoreReviewResponse{}, err
	}

	return models.ChoreReviewResponse{
		ID:             review.ID,
		ReviewerID:     review.ReviewerID,
		ReviewerName:   review.Reviewer.Name,
		ReviewerStatus: review.ReviewerStatus,
		ReviewComment:  review.Review,
		CreatedAt:      review.CreatedAt,
	}, nil
}

func (s *dbService) MarkNotificationsAsSeen(accountID uuid.UUID, notificationIDs []uuid.UUID) error {
	return s.db.Model(&models.AccountNotification{}).
		Where("account_id = ? AND id IN ?", accountID, notificationIDs).
		Update("seen", true).Error
}
