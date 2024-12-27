import { api } from './api';
import type {
  Transaction,
  TransactionSplit,
  TransactionSummary,
  CreateTransactionParams,
} from '../models/transactions';

export const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    settleTransactionSplit: builder.mutation<
      void,
      { accountId: string; householdId: string; splitId: string }
    >({
      query: ({ accountId, householdId, splitId }) => ({
        url: `/accounts/${accountId}/households/${householdId}/transactions/${splitId}/settle`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { householdId, accountId }) => [
        { type: 'Transaction', id: householdId },
        { type: 'Transaction', id: `${accountId}-${householdId}` },
        'Transaction',
      ],
    }),
  }),
});

export const {
  useGetTransactionSummaryQuery,
  useCreateTransactionMutation,
  useSettleTransactionSplitMutation,
} = transactionsApi;
