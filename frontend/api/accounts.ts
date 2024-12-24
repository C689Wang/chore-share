import { client } from "./client";

export interface User {
  id: string;
  name: string;
  googleId: string;
}

export const accountApi = {
  createAccount: async (params: { google_id: string; name: string }) => {
    return client.post("/accounts", params);
  },

  getAccount: async (accountId: string) => {
    return client.get(`/accounts/${accountId}`);
  },

  getAccountByGoogleId: async (googleId: string) => {
    return client.get(`/accounts/google/${googleId}`);
  },
};
