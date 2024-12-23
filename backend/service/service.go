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
	CreateChore(chore *models.Chore) error
	GetChores(householdID uuid.UUID) ([]models.Chore, error)
	GetChore(choreId uuid.UUID) (models.Chore, error)
	GetAccount(accountId uuid.UUID) (models.Account, error)
	CreateHousehold(household *models.Household) error
	JoinHousehold(householdId uuid.UUID, accountId uuid.UUID, password string) error
}

type dbService struct {
	db *gorm.DB
}

func NewDBService(connUrl string) DBService {
	db, err := gorm.Open(postgres.Open(connUrl), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.Account{}, &models.Chore{}, &models.Household{})
	return &dbService{db: db}
}

func (s *dbService) CreateAccount(account *models.Account) error {
	return s.db.Create(account).Error
}

func (s *dbService) GetAccount(accountId uuid.UUID) (models.Account, error) {
	var account models.Account
	return account, s.db.First(&account, accountId).Error
}

func (s *dbService) CreateChore(chore *models.Chore) error {
	return s.db.Create(chore).Error
}

func (s *dbService) GetChores(householdID uuid.UUID) ([]models.Chore, error) {
	var chores []models.Chore
	return chores, s.db.Where("household_id = ?", householdID).Find(&chores).Error
}

func (s *dbService) GetChore(choreId uuid.UUID) (models.Chore, error) {
	var chore models.Chore
	return chore, s.db.First(&chore, choreId).Error
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

	// Update account's household
	householdIdStr := householdId.String()
	result := s.db.Model(&models.Account{}).Where("id = ?", accountId).Update("household_id", householdIdStr)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("account not found")
	}

	return nil
}