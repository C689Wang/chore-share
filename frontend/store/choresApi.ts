import { api } from "./api";
import type { AccountChore, Chore, CreateChoreParams } from "../models/chores";

export const choresApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all chores for a household
    getHouseholdChores: builder.query<Chore[], string>({
      query: (householdId) => `/households/${householdId}/chores`,
      providesTags: (result, error, householdId) => [
        { type: 'Chore', id: householdId },
        'Chore',
      ],
    }),

    // Get chores assigned to an account
    getAccountChores: builder.query<AccountChore[], {accountId: string, householdId: string}>({
      query: ({accountId, householdId}) => `/accounts/${accountId}/households/${householdId}/chores`,
      providesTags: (result, error, {accountId, householdId}) => [
        { type: 'Chore', id: `account-${accountId}-household-${householdId}` },
        'Chore',
      ],
    }),

    // Create a new chore
    createChore: builder.mutation<Chore, { householdId: string; params: CreateChoreParams }>({
      query: ({ householdId, params }) => ({
        url: `/households/${householdId}/chores`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (result, error, { householdId }) => [
        { type: 'Chore', id: householdId },
        'Chore',
      ],
    }),

    // // Toggle chore completion
    // toggleChoreCompletion: builder.mutation<void, { choreId: string; completed: boolean }>({
    //   query: ({ choreId, completed }) => ({
    //     url: `/chores/${choreId}/complete`,
    //     method: 'PUT',
    //     body: { completed },
    //   }),
    //   invalidatesTags: ['Chore'],
    // }),
  }),
});

export const {
  useGetHouseholdChoresQuery,
  useGetAccountChoresQuery,
  useCreateChoreMutation
} = choresApi;
