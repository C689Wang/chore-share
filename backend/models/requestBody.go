package models

type CreateAccountRequestBody struct {
	GoogleId    string `json:"google_id"`
	Name string `json:"name"`
}

type CreateChoreRequestBody struct {
	Title string `json:"title"`
	AssignedTo string `json:"assigned_to"`
	HouseholdID string `json:"household_id"`
}

type CreateHouseholdRequestBody struct {
	Name string `json:"name"`
	Password string `json:"password"`
}

type JoinHouseholdRequestBody struct {
	HouseholdID string `json:"household_id" binding:"required"`
	Password    string `json:"password" binding:"required"`
	AccountID   string `json:"account_id" binding:"required"`
}