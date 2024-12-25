export interface Household {
  id: string;
  name: string;
}

export interface LeaderboardEntry {
  accountId: string;
  accountName: string;
  points: number;
}

export interface CreateHouseholdParams {
  name: string;
  password: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
}
