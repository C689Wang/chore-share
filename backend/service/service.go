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
	GetHouseholdTransactions(householdID uuid.UUID, month time.Time) ([]models.Transaction, error)
	CreateTransaction(transaction *models.Transaction) error
	GetTransactionSummary(accountID, householdID uuid.UUID, month time.Time) (models.TransactionSummary, error)
	GetTransactionSplits(transactionID uuid.UUID) ([]models.TransactionSplit, error)
	SettleTransactionSplit(splitID uuid.UUID) error
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

	switch chore.Type {
	case models.ChoreTypeOneTime:
		// For one-time chores, create single AccountChore
		if len(assignees) > 0 {
			accountChore := models.AccountChore{
				ChoreID:       chore.ID,
				AccountID:     assignees[0],
				HouseholdID:   chore.HouseholdID,
				DueDate:       chore.EndDate,
				Status:        models.AssignmentStatusPending,
				Points:        chore.Points,
			}
			if err := tx.Create(&accountChore).Error; err != nil {
				tx.Rollback()
				return err
			}
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

		// Generate initial assignments
		if err := s.generateInitialAssignments(tx, chore, assignees); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *dbService) generateInitialAssignments(tx *gorm.DB, chore *models.Chore, assignees []uuid.UUID) error {
	// Get the schedule
	var schedules []models.ChoreSchedule
	if err := tx.Where("chore_id = ?", chore.ID).Find(&schedules).Error; err != nil {
		return err
	}

	// Generate assignments for next week only
	startDate := time.Now()
	endDate := startDate.AddDate(0, 0, 7)
	assigneeIndex := 0
	isFirstAssignment := true

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
				
				// First assignment is PENDING, rest are PLANNED
				status := models.AssignmentStatusPlanned
				if isFirstAssignment {
					status = models.AssignmentStatusPending
					isFirstAssignment = false
				}

				accountChore := models.AccountChore{
					ChoreID:       chore.ID,
					AccountID:     assignees[assigneeIndex],
					HouseholdID:   chore.HouseholdID,
					DueDate:       dueDate,
					Status:        status,
					RotationOrder: assigneeIndex,
					Points:        chore.Points,
				}

				if err := tx.Create(&accountChore).Error; err != nil {
					return err
				}

				assigneeIndex = (assigneeIndex + 1) % len(assignees)
			}
		}
	}
	return nil
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

	// Find the current chore assignment
	var accountChore models.AccountChore
	if err := tx.Where("id = ? AND status = ?", 
		accountChoreId, models.AssignmentStatusPending).
		First(&accountChore).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Get the associated chore to check if it's recurring
	var chore models.Chore
	if err := tx.First(&chore, accountChore.ChoreID).Error; err != nil {
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

	if chore.Type == models.ChoreTypeRecurring {
		// Handle recurring chore logic
		if err := s.handleRecurringChoreCompletion(tx, &chore, &accountChore); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *dbService) handleRecurringChoreCompletion(tx *gorm.DB, chore *models.Chore, completedChore *models.AccountChore) error {
	// Get the rotation for this chore
	var rotations []models.ChoreRotation
	if err := tx.Where("chore_id = ?", chore.ID).Order("rotation_order").Find(&rotations).Error; err != nil {
		return err
	}

	// Get the schedule
	var schedules []models.ChoreSchedule
	if err := tx.Where("chore_id = ?", chore.ID).Find(&schedules).Error; err != nil {
		return err
	}

	// Find the next assignee in rotation
	nextRotationOrder := (completedChore.RotationOrder + 1) % len(rotations)
	nextAssignee := rotations[nextRotationOrder].AccountID

	// Get the next occurrence date based on completion time
	nextDate := s.calculateNextOccurrence(completedChore.DueDate, schedules)

	// Check if there's already a future assignment
	var existingAssignment models.AccountChore
	err := tx.Where("chore_id = ? AND due_date = ? AND status IN (?)",
		chore.ID, nextDate, []models.AssignmentStatus{models.AssignmentStatusPending, models.AssignmentStatusPlanned}).
		Order("due_date").First(&existingAssignment).Error

	if err == gorm.ErrRecordNotFound {
		// Create new assignment if none exists
		newAssignment := models.AccountChore{
			ChoreID:       chore.ID,
			AccountID:     nextAssignee,
			HouseholdID:   chore.HouseholdID,
			DueDate:       nextDate,
			Status:        models.AssignmentStatusPending,
			RotationOrder: nextRotationOrder,
			Points:        chore.Points,
		}
		if err := tx.Create(&newAssignment).Error; err != nil {
			return err
		}
	} else if err != nil {
		return err
	} else if completedChore.CompletedAt.After(existingAssignment.DueDate) {
		// If completed late, update future assignments' due dates
		if err := s.updateFutureAssignments(tx, chore, completedChore, schedules); err != nil {
			return err
		}
	} else {
		// If completed on time, set the next assignment as pending
		existingAssignment.Status = models.AssignmentStatusPending
		if err := tx.Save(&existingAssignment).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *dbService) calculateNextOccurrence(lastDueDate time.Time, schedules []models.ChoreSchedule) time.Time {	
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
	nextDate := s.calculateNextOccurrence(*completedChore.CompletedAt, schedules)

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
		nextDate = s.calculateNextOccurrence(nextDate, schedules)
	}

	return nil
}

func (s *dbService) GetHouseholdTransactions(householdID uuid.UUID, month time.Time) ([]models.Transaction, error) {
	var transactions []models.Transaction
	
	// Get start and end of month
	startOfMonth := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)
	
	err := s.db.Where("household_id = ? AND spent_at BETWEEN ? AND ?", 
		householdID, startOfMonth, endOfMonth).
		Order("spent_at DESC").
		Find(&transactions).Error
	
	return transactions, err
}

func (s *dbService) CreateTransaction(transaction *models.Transaction) error {
	tx := s.db.Begin()
	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Get household members
	var members []models.Account
	if err := tx.Model(&models.Account{}).
		Joins("JOIN account_households ON accounts.id = account_households.account_id").
		Where("account_households.household_id = ?", transaction.HouseholdID).
		Find(&members).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Calculate split amount (including the payer)
	splitCount := len(members)
	if splitCount == 0 {
		tx.Rollback()
		return errors.New("no other members to split with")
	}
	
	amountPerPerson := transaction.AmountInCents / int64(splitCount)

	// Create splits for each member except the payer
	for _, member := range members {
		if member.ID == transaction.PaidByID {
			continue
		}

		split := models.TransactionSplit{
			TransactionID: transaction.ID,
			OwedByID:     member.ID,
			OwedToID:     transaction.PaidByID,
			AmountInCents: amountPerPerson,  // Each person owes their share
			IsSettled:    false,
		}

		if err := tx.Create(&split).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func (s *dbService) GetTransactionSummary(accountID, householdID uuid.UUID, month time.Time) (models.TransactionSummary, error) {
	startOfMonth := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)
	
	var summary models.TransactionSummary
	summary.Month = month

	// Calculate total owed to user
	err := s.db.Model(&models.TransactionSplit{}).
		Select("COALESCE(SUM(amount_in_cents), 0)").
		Where("owed_to_id = ? AND is_settled = ? AND transaction_id IN (?)",
			accountID, false,
			s.db.Model(&models.Transaction{}).
				Select("id").
				Where("household_id = ? AND spent_at BETWEEN ? AND ?",
					householdID, startOfMonth, endOfMonth)).
		Scan(&summary.TotalOwed).Error
	if err != nil {
		return summary, err
	}

	// Calculate total owing by user
	err = s.db.Model(&models.TransactionSplit{}).
		Select("COALESCE(SUM(amount_in_cents), 0)").
		Where("owed_by_id = ? AND is_settled = ? AND transaction_id IN (?)",
			accountID, false,
			s.db.Model(&models.Transaction{}).
				Select("id").
				Where("household_id = ? AND spent_at BETWEEN ? AND ?",
					householdID, startOfMonth, endOfMonth)).
		Scan(&summary.TotalOwing).Error
	if err != nil {
		return summary, err
	}

	// Get detailed breakdown of who owes the user
	var owedDetails []models.TransactionOwedDetail
	err = s.db.Model(&models.TransactionSplit{}).
		Select("owed_by_id, accounts.name as owed_by_name, SUM(amount_in_cents) as amount_in_cents").
		Joins("JOIN accounts ON accounts.id = transaction_splits.owed_by_id").
		Where("owed_to_id = ? AND is_settled = ? AND transaction_id IN (?)",
			accountID, false,
			s.db.Model(&models.Transaction{}).
				Select("id").
				Where("household_id = ? AND spent_at BETWEEN ? AND ?",
					householdID, startOfMonth, endOfMonth)).
		Group("owed_by_id, accounts.name").
		Scan(&owedDetails).Error
	if err != nil {
		return summary, err
	}
	summary.OwedDetails = owedDetails

	// Get detailed breakdown of what user owes to others
	var owingDetails []models.TransactionOwingDetail
	err = s.db.Model(&models.TransactionSplit{}).
		Select("owed_to_id, accounts.name as owed_to_name, SUM(amount_in_cents) as amount_in_cents").
		Joins("JOIN accounts ON accounts.id = transaction_splits.owed_to_id").
		Where("owed_by_id = ? AND is_settled = ? AND transaction_id IN (?)",
			accountID, false,
			s.db.Model(&models.Transaction{}).
				Select("id").
				Where("household_id = ? AND spent_at BETWEEN ? AND ?",
					householdID, startOfMonth, endOfMonth)).
		Group("owed_to_id, accounts.name").
		Scan(&owingDetails).Error
	if err != nil {
		return summary, err
	}
	summary.OwingDetails = owingDetails

	return summary, nil
}

func (s *dbService) GetTransactionSplits(transactionID uuid.UUID) ([]models.TransactionSplit, error) {
	var splits []models.TransactionSplit
	err := s.db.Where("transaction_id = ?", transactionID).
		Preload("Transaction").
		Find(&splits).Error
	return splits, err
}

func (s *dbService) SettleTransactionSplit(splitID uuid.UUID) error {
	var split models.TransactionSplit
	err := s.db.Where("id = ?", splitID).First(&split).Error
	if err != nil {
		return err
	}

	split.IsSettled = true
	split.SettledAt = &time.Time{}

	return s.db.Save(&split).Error
}