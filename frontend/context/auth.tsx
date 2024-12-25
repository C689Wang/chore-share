import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { accountApi, User } from "../api/accounts";

interface GoogleUser {
  id: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (googleUser: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });

    // Check if user is already signed in
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const isSignedIn = GoogleSignin.hasPreviousSignIn();
      if (isSignedIn) {
        const currentUser = GoogleSignin.getCurrentUser();
        if (!currentUser) {
          const response = await GoogleSignin.signInSilently();
          await handleExistingGoogleUser(response.data?.user);
        } else {
          await handleExistingGoogleUser(currentUser.user);
        }
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingGoogleUser = async (
    googleUser: GoogleUser | undefined
  ) => {
    try {
      if (!googleUser) {
        throw new Error("Google user is null");
      }
      const account = await accountApi.getAccountByGoogleId(googleUser.id);
      if (!account.error) {
        setUser({
          id: account.id,
          name: account.name,
          googleId: account.googleId,
        });
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
    }
  };

  const handleNewGoogleUser = async (googleUser: any) => {
    try {
      let account = await accountApi.getAccountByGoogleId(googleUser.id);
      if (account.error) {
        account = await accountApi.createAccount({
          google_id: googleUser.id,
          name: googleUser.name,
        });
      }
      setUser({
        id: account.id,
        name: account.name,
        googleId: account.google_id,
      });
    } catch (error) {
      console.error("Error handling Google user:", error);
      throw error;
    }
  };

  const signIn = async (googleUser: any) => {
    await handleNewGoogleUser(googleUser);
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
