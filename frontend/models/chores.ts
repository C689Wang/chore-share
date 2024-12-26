export type ChoreType = "ONE_TIME" | "RECURRING";
export type FrequencyType = "DAILY" | "WEEKLY";
export enum AssignmentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
  PLANNED = "PLANNED"
}

export interface CreateChoreParams {
  title: string;
  description?: string;
  type: ChoreType;
  endDate: Date; // Required for recurring
  frequency?: FrequencyType; // Required for recurring
  schedule?: number[]; // Days of week for recurring (1-7 for Monday-Sunday)
  assigneeIds: string[]; // UUID strings
  points: number;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  type: ChoreType;
  status: string;
  householdId: string;
  createdAt: Date;
}

export interface AccountChore {
  id: string;
  choreId: string;
  accountId: string;
  accountName?: string;
  dueDate: Date;
  status: AssignmentStatus;
  completedAt?: Date;
  points: number;
  chore: Chore;
}

export interface ChoreRotation {
  id: string;
  choreId: string;
  accountId: string;
  householdId: string;
  rotationOrder: number;
}

export interface ChoreSchedule {
  id: string;
  choreId: string;
  dayOfWeek: number; // 1-7 for Monday-Sunday
}

// Add a helper function to check if a chore can be toggled
export function canToggleChore(status: AssignmentStatus): boolean {
  return status === AssignmentStatus.PENDING || status === AssignmentStatus.OVERDUE;
}
