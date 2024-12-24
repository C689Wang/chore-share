export interface Chore {
  id: string;
  title: string;
  completed: boolean;
  householdId: string;
  createdAt: string;
}

export interface AccountChore {
  id: string;
  choreId: string;
  accountId: string;
  dueDate: string | null;
  completed: boolean;
  chore: Chore;
}

export interface CreateChoreParams {
  title: string;
  description: string;
  assignedTo: string[];
}
