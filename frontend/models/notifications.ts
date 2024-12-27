export interface NotificationResponse {
  id: string;
  seen: boolean;
  createdAt: string;
  action: NotificationAction;
  actor: ActorInfo;
  choreInfo?: ChoreInfo;
  reviewInfo?: ReviewInfo;
  transactionInfo?: TransactionInfo;
  splitInfo?: SplitInfo;
}

export interface ActorInfo {
  id: string;
  name: string;
}

export interface ChoreInfo {
  choreId: string;
  accountChoreId: string;
  title: string;
  dueDate: string;
}

export interface ReviewInfo {
  reviewId: string;
  review: string;
  choreName: string;
  accountChoreId: string;
}

export interface TransactionInfo {
  transactionId: string;
  description: string;
  amountInCents: number;
}

export interface SplitInfo {
  splitId: string;
  amountInCents: number;
  owedById: string;
  owedToId: string;
  description: string;
  owedByName: string;
  owedToName: string;
}

export enum NotificationAction {
  CHORE_ASSIGNED = 'CHORE_ASSIGNED',
  CHORE_PENDING = 'CHORE_PENDING',
  CHORE_COMPLETED = 'CHORE_COMPLETED',
  TRANSACTION_ADDED = 'TRANSACTION_ADDED',
  TRANSACTION_SETTLED = 'TRANSACTION_SETTLED',
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',
}
