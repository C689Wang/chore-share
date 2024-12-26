export interface Transaction {
  id: string;
  householdId: string;
  paidById: string;
  amountInCents: number;
  description: string;
  spentAt: string;
  createdAt: string;
}

export interface TransactionSplit {
  id: string;
  transactionId: string;
  owedById: string;
  owedToId: string;
  amountInCents: number;
  isSettled: boolean;
  settledAt?: string;
  transaction?: Transaction;
}

export interface TransactionOwedDetail {
  owedById: string;
  owedByName: string;
  amountInCents: number;
  splits: TransactionSplit[];
}

export interface TransactionOwingDetail {
  owedToId: string;
  owedToName: string;
  amountInCents: number;
  splits: TransactionSplit[];
}

export interface TransactionSummary {
  month: string;
  totalOwed: number;
  totalOwing: number;
  owedDetails: TransactionOwedDetail[];
  owingDetails: TransactionOwingDetail[];
}

export interface CreateTransactionParams {
  description: string;
  amountInCents: number;
  spentAt: string;
}
