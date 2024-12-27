import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_API_URL }),
  tagTypes: ['Household', 'Chore', 'Transaction', 'Notification'],
  endpoints: () => ({}),
});
