import { client } from "./client";

export interface User {
  id: string;
  name: string;
  googleId: string;
}

export const accountApi = {
  createAccount: async (params: { google_id: string; name: string }) => {
    return client.post("/account", params);
  },

  getAccount: async (accountId: string) => {
    return client.get(`/account/${accountId}`);
  },

  getAccountByGoogleId: async (googleId: string) => {
    return client.get(`/account/google/${googleId}`);
  },
};
