import { client } from './client';

export interface Household {
  id: string;
  name: string;
}

export interface CreateHouseholdParams {
  name: string;
  password: string;
}

export const householdApi = {
  getHouseholds: async (accountId: string) => {
    return client.get(`/account/${accountId}/households`);
  },

  joinHousehold: async (params: {
    householdID: string;
    accountID: string;
    password: string;
  }) => {
    return client.post('/household/join', params);
  },

  createHousehold: async (accountId: string, params: CreateHouseholdParams) => {
    const response = await client.post(`/account/${accountId}/household`, params);
    return response.data;
  },
}; 