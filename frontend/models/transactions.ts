export interface Transaction {
  id: string;
  description: string;
  amountInCents: number;
  spentAt: string | Date;
}

export interface TransactionSplit {
  id: string;
  transactionId: string;
  description: string;
  spentAt: string | Date;
  owedById: string;
  owedToId: string;
  amountInCents: number;
  isSettled: boolean;
  settledAt?: string;
  owedBy: {
    id: string;
    name: string;
  };
  owedTo: {
    id: string;
    name: string;
  };
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
  month: string | Date;
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
