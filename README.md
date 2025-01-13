# chore-share

<img width="361" alt="Screenshot 2025-01-13 at 12 43 36 PM" src="https://github.com/user-attachments/assets/f409bc98-cd0f-4907-8ca7-eede899d3ef4" />

<img width="355" alt="Screenshot 2025-01-13 at 12 46 43 PM" src="https://github.com/user-attachments/assets/1933a5a0-032f-4e1c-8eec-ce60a32e565f" />

<img width="361" alt="Screenshot 2025-01-13 at 12 47 32 PM" src="https://github.com/user-attachments/assets/6ce5b76e-1cb2-4b65-b0b2-c25f2a1aba5c" />

<img width="356" alt="Screenshot 2025-01-13 at 12 48 45 PM" src="https://github.com/user-attachments/assets/59a53f4e-1e94-4258-bdf8-6580d47583aa" />

<img width="355" alt="Screenshot 2025-01-13 at 12 49 11 PM" src="https://github.com/user-attachments/assets/23b758f5-caa0-4547-a641-c917869b4831" />

<img width="355" alt="Screenshot 2025-01-13 at 12 49 32 PM" src="https://github.com/user-attachments/assets/a404afab-2f52-4d5e-a463-0f06782afd40" />

Chore Share is a full-stack mobile application designed to help households manage and track shared responsibilities. The app allows users to create households, assign and track chores, manage shared expenses, and maintain a fair distribution of household tasks through a gamified point system.

## Features

### Authentication & Household Management
- Google Sign-In integration
- Create and join households with password protection
- Switch between multiple households
- Manage household members

### Chore Management
- Create one-time and recurring chores
- Assign chores to household members
- Set chore difficulty levels with corresponding point values
- Track chore completion status
- View chores by week or by assigned member
- Rotation system for recurring chores
- Chore review system for quality control

### Financial Management
- Track shared expenses
- Automatic split calculation among household members
- Monthly transaction summaries
- Settle individual transactions
- View owed and owing amounts

### Gamification & Engagement
- Point-based leaderboard system
- Monthly household rankings
- Crown indicator for top performer
- In-app notifications for chore assignments and completions

### User Experience
- Real-time updates
- Pull-to-refresh functionality
- Intuitive navigation with tab-based interface
- Clean and modern UI design

## Technical Stack

### Backend (Go)
- **Framework**: Gin (Web Framework)
- **Database**: PostgreSQL with GORM
- **Authentication**: Google OAuth
- **Architecture**: RESTful API
- **Key Packages**:
  - `github.com/gin-gonic/gin` - Web framework
  - `gorm.io/gorm` - ORM
  - `github.com/google/uuid` - UUID generation
  - `golang.org/x/crypto` - Password hashing

### Frontend (React Native/Expo)
- **Framework**: Expo with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Navigation**: Expo Router
- **UI Components**: Custom components with React Native core components
- **Key Packages**:
  - `@react-native-google-signin/google-signin` - Google authentication
  - `@reduxjs/toolkit` - State management
  - `expo-router` - Navigation

## Implementation Details

### Backend Architecture
- **Models**: Structured data models for accounts, households, chores, transactions
- **Controllers**: RESTful endpoints for all app functionalities
- **Services**: Business logic layer handling database operations
- **Database**: Relational schema with proper foreign key relationships
- **Authentication**: Token-based authentication with Google OAuth

### Frontend Architecture
- **Context**: Auth context for user management
- **Store**: Redux store with RTK Query for API integration
- **Components**: Reusable UI components
- **Styles**: Custom styling with React Native StyleSheet
- **Navigation**: File-based routing with Expo Router
- **Types**: Strong TypeScript typing for all components and data structures

### Key Features Implementation
1. **Chore System**
   - Recurring chore scheduling with rotation
   - Point-based difficulty levels
   - Status tracking (Pending, Completed, Overdue)
   - Review system for completed chores

2. **Transaction System**
   - Automatic expense splitting
   - Monthly summaries
   - Settlement tracking
   - Detailed transaction history

3. **Notification System**
   - Real-time notifications for chore assignments
   - Transaction updates
   - Review notifications
   - Mark as seen functionality

## Getting Started

### Frontend

```
cd frontend
npx expo start 
```
### Backend

```
cd backend
go build .
go run .
```
### Database

```
cd backend
docker compose up --build
```
