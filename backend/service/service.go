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
	CreateAccountChore(accountChore *models.AccountChore) error
	GetAccount(accountId uuid.UUID) (models.AccountResponse, error)
	GetAccountByGoogleId(googleId string) (models.AccountResponse, error)
	CreateHousehold(household *models.Household) error
	JoinHousehold(householdId uuid.UUID, accountId uuid.UUID, password string) error
	GetAccountHouseholds(accountId uuid.UUID) ([]models.HouseholdResponse, error)
	GetAccountChores(accountId uuid.UUID, householdId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdChores(householdId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdLeaderboard(householdId uuid.UUID) ([]models.LeaderboardEntryResponse, error)
	GetHouseholdMembers(householdId uuid.UUID) ([]models.HouseholdMemberResponse, error)
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

func (s *dbService) CreateAccountChore(accountChore *models.AccountChore) error {
	return s.db.Create(accountChore).Error
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
	err := s.db.Preload("Chore").
		Where("account_id = ? AND household_id = ?", accountId, householdId).
		Where("(status = ? OR (status = ? AND completed_at BETWEEN ? AND ?))",
			models.AssignmentStatusPending,
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
			DueDate:     ac.DueDate,
			Status:      ac.Status,
			CompletedAt: ac.CompletedAt,
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Description: ac.Chore.Description,
				Type:        ac.Chore.Type,
				Status:      ac.Chore.Status,
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
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Description: ac.Chore.Description,
				Type:        ac.Chore.Type,
				Status:      ac.Chore.Status,
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
			Points      uint
	}
	
	err := s.db.Table("account_households").
		Select("account_households.account_id, accounts.name as account_name, account_households.points").
		Joins("JOIN accounts ON accounts.id = account_households.account_id").
		Where("account_households.household_id = ?", householdId).
		Order("account_households.points DESC").
		Scan(&entries).Error
	
	if err != nil {
		return nil, err
	}

	response := make([]models.LeaderboardEntryResponse, len(entries))
	for i, entry := range entries {
		response[i] = models.LeaderboardEntryResponse{
			AccountID:   entry.AccountID,
			AccountName: entry.AccountName,
			Points:      entry.Points,
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
