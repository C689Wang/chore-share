package service

import (
	"chore-share/models"
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBService interface {
	CreateAccount(account *models.Account) error
	CreateChore(chore *models.Chore, assignedTo uuid.UUID) error
	CreateAccountChore(accountChore *models.AccountChore) error
	GetAccount(accountId uuid.UUID) (models.AccountResponse, error)
	GetAccountByGoogleId(googleId string) (models.AccountResponse, error)
	CreateHousehold(household *models.Household) error
	JoinHousehold(householdId uuid.UUID, accountId uuid.UUID, password string) error
	GetAccountHouseholds(accountId uuid.UUID) ([]models.HouseholdResponse, error)
	GetAccountChores(accountId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdChores(householdId uuid.UUID) ([]models.AccountChoreResponse, error)
	GetHouseholdLeaderboard(householdId uuid.UUID) ([]models.LeaderboardEntryResponse, error)
}

type dbService struct {
	db *gorm.DB
}

func NewDBService(connUrl string) DBService {
	db, err := gorm.Open(postgres.Open(connUrl), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.Account{}, &models.Chore{}, &models.Household{}, &models.AccountHousehold{}, &models.AccountChore{})
	return &dbService{db: db}
}

func (s *dbService) CreateAccount(account *models.Account) error {
	return s.db.Create(account).Error
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

func (s *dbService) CreateChore(chore *models.Chore, assignedTo uuid.UUID) error {
	err := s.db.Create(chore).Error
	if err != nil {
		return err
	}
	if assignedTo != uuid.Nil {
		accountChore := models.AccountChore{
			AccountID: assignedTo,
			ChoreID: chore.ID,
		}

		err := s.db.Create(&accountChore).Error
		if err != nil {
			return err
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

func (s *dbService) GetAccountChores(accountId uuid.UUID) ([]models.AccountChoreResponse, error) {
	var accountChores []models.AccountChore
	err := s.db.Preload("Chore").
		Where("account_id = ?", accountId).
		Find(&accountChores).Error
	if err != nil {
		return nil, err
	}

	response := make([]models.AccountChoreResponse, len(accountChores))
	for i, ac := range accountChores {
		response[i] = models.AccountChoreResponse{
			ID:        ac.ID,
			ChoreID:   ac.ChoreID,
			AccountID: ac.AccountID,
			DueDate:   &ac.DueDate,
			Completed: ac.Completed,
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Completed:   ac.Chore.Completed,
				HouseholdID: ac.Chore.HouseholdID,
				CreatedAt:   ac.Chore.CreatedAt,
			},
		}
	}
	return response, nil
}

func (s *dbService) GetHouseholdChores(householdId uuid.UUID) ([]models.AccountChoreResponse, error) {
	var accountChores []models.AccountChore
	err := s.db.Preload("Chore").
		Joins("JOIN chores ON chores.id = account_chores.chore_id").
		Where("chores.household_id = ?", householdId).
		Find(&accountChores).Error
	if err != nil {
		return nil, err
	}

	response := make([]models.AccountChoreResponse, len(accountChores))
	for i, ac := range accountChores {
		response[i] = models.AccountChoreResponse{
			ID:        ac.ID,
			ChoreID:   ac.ChoreID,
			AccountID: ac.AccountID,
			DueDate:   &ac.DueDate,
			Completed: ac.Completed,
			Chore: models.ChoreResponse{
				ID:          ac.Chore.ID,
				Title:       ac.Chore.Title,
				Completed:   ac.Chore.Completed,
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