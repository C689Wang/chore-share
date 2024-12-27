import { api } from './api';
import type { AccountChore, CreateChoreParams } from '../models/chores';
import {
  ReviewResponse,
  CreateReviewRequest,
  ChoreReviewResponse,
} from '@/models/reviews';

export const choresApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all chores for a household
    getHouseholdChores: builder.query<AccountChore[], string>({
      query: (householdId) => `/households/${householdId}/chores`,
      providesTags: (result, error, householdId) => [
        { type: 'Chore', id: householdId },
        'Chore',
      ],
    }),

    // Get chores assigned to an account
    getAccountChores: builder.query<
      AccountChore[],
      { accountId: string; householdId: string }
    >({
      query: ({ accountId, householdId }) =>
        `/accounts/${accountId}/households/${householdId}/chores`,
      providesTags: (result, error, { accountId, householdId }) => [
        { type: 'Chore', id: `account-${accountId}-household-${householdId}` },
        'Chore',
      ],
    }),

    // Create a new chore
    createChore: builder.mutation<
      { id: string; message: string },
      { accountId: string; householdId: string; params: CreateChoreParams }
    >({
      query: ({ accountId, householdId, params }) => ({
        url: `/accounts/${accountId}/households/${householdId}/chores`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, { householdId, accountId }) => [
        { type: 'Chore', id: householdId },
        { type: 'Chore', id: `account-${accountId}-household-${householdId}` },
        'Chore',
      ],
    }),

    // Toggle chore completion
    toggleChoreCompletion: builder.mutation<
      void,
      { accountId: string; householdId: string; choreId: string }
    >({
      query: ({ accountId, householdId, choreId }) => ({
        url: `/accounts/${accountId}/households/${householdId}/chores/${choreId}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { householdId, accountId }) => [
        { type: 'Chore', id: householdId },
        { type: 'Chore', id: `account-${accountId}-household-${householdId}` },
        'Chore',
        { type: 'Household', id: `${householdId}-leaderboard` },
      ],
    }),

    createReview: builder.mutation<
      ReviewResponse,
      {
        accountChoreId: string;
        reviewerId: string;
        householdId: string;
        body: CreateReviewRequest;
      }
    >({
      query: ({ accountChoreId, reviewerId, householdId, body }) => ({
        url: `/accounts/${reviewerId}/households/${householdId}/chores/${accountChoreId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification', 'Chore'],
    }),

    getChoreReview: builder.query<
      ChoreReviewResponse,
      {
        accountId: string;
        householdId: string;
        accountChoreId: string;
        reviewId: string;
      }
    >({
      query: ({ accountId, householdId, accountChoreId, reviewId }) => ({
        url: `/accounts/${accountId}/households/${householdId}/chores/${accountChoreId}/reviews/${reviewId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetHouseholdChoresQuery,
  useGetAccountChoresQuery,
  useCreateChoreMutation,
  useToggleChoreCompletionMutation,
  useCreateReviewMutation,
  useGetChoreReviewQuery,
} = choresApi;
