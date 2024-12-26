import { api } from './api';
import type {
  Transaction,
  TransactionSplit,
  TransactionSummary,
  CreateTransactionParams,
} from '../models/transactions';

export const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get transactions for a household in a specific month
    getHouseholdTransactions: builder.query<
      Transaction[],
      { householdId: string; month?: string }
    >({
      query: ({ householdId, month }) => ({
        url: `/accounts/${householdId}/transactions`,
        params: { month },
      }),
      providesTags: (result, error, { householdId }) => [
        { type: 'Transaction', id: householdId },
        'Transaction',
      ],
    }),

    // Get transaction summary for a user in a household
    getTransactionSummary: builder.query<
      TransactionSummary,
      { accountId: string; householdId: string; month?: string }
    >({
      query: ({ accountId, householdId, month }) => ({
        url: `/accounts/${accountId}/households/${householdId}/transactions/summary`,
        params: { month },
      }),
      providesTags: (result, error, { householdId, accountId }) => [
        { type: 'Transaction', id: `${accountId}-${householdId}` },
        'Transaction',
      ],
    }),

    // Get splits for a specific transaction
    getTransactionSplits: builder.query<TransactionSplit[], string>({
      query: (transactionId) => `/transactions/${transactionId}/splits`,
      providesTags: (result, error, transactionId) => [
        { type: 'Transaction', id: `splits-${transactionId}` },
        'Transaction',
      ],
    }),

    // Create a new transaction
    createTransaction: builder.mutation<
      void,
      {
        accountId: string;
        householdId: string;
        params: CreateTransactionParams;
      }
    >({
      query: ({ accountId, householdId, params }) => ({
        url: `/accounts/${accountId}/households/${householdId}/transactions`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, { householdId, accountId }) => [
        { type: 'Transaction', id: householdId },
        { type: 'Transaction', id: `${accountId}-${householdId}` },
        'Transaction',
      ],
    }),

    // Settle a transaction split
    settleTransactionSplit: builder.mutation<void, string>({
      query: (splitId) => ({
        url: `/transactions/splits/${splitId}/settle`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, splitId) => ['Transaction'],
    }),
  }),
});

export const {
  useGetHouseholdTransactionsQuery,
  useGetTransactionSummaryQuery,
  useGetTransactionSplitsQuery,
  useCreateTransactionMutation,
  useSettleTransactionSplitMutation,
} = transactionsApi;
