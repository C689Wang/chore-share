import { api } from "./api";
import type {
  Household,
  CreateHouseholdParams,
  LeaderboardEntry,
  HouseholdMember,
} from "../models/households";

export const householdsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholds: builder.query<Household[], string>({
      query: (accountId) => `/accounts/${accountId}/households`,
      providesTags: ["Household"],
    }),

    createHousehold: builder.mutation<
      Household,
      { accountId: string; params: CreateHouseholdParams }
    >({
      query: ({ accountId, params }) => ({
        url: `/accounts/${accountId}/households`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Household"],
    }),

    joinHousehold: builder.mutation<
      void,
      { householdID: string; accountID: string; password: string }
    >({
      query: (body) => ({
        url: "/households/join",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Household"],
    }),

    getHouseholdLeaderboard: builder.query<LeaderboardEntry[], string>({
      query: (householdId) => `/households/${householdId}/leaderboard`,
      providesTags: (result, error, householdId) => [
        { type: "Household", id: `${householdId}-leaderboard` },
        "Household",
      ],
    }),

    getHouseholdMembers: builder.query<HouseholdMember[], string>({
      query: (householdId) => `/households/${householdId}/members`,
      providesTags: (result, error, householdId) => [
        { type: "Household", id: householdId },
        "Household",
      ],
    }),
  }),
});

export const {
  useGetHouseholdsQuery,
  useCreateHouseholdMutation,
  useJoinHouseholdMutation,
  useGetHouseholdLeaderboardQuery,
  useGetHouseholdMembersQuery,
} = householdsApi;
