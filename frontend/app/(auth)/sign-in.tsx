import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";

const styles = StyleSheet.create({
  title: {
    marginBottom: 100,
  },
  container: {
    flexDirection: "column",
    paddingBottom: 68,
    justifyContent: "flex-end",
    alignItems: "center",
    height: "100%",
    margin: "auto",
  },
  inputField: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 16,
    width: "80%",
    height: 40,
  },
  headerImage: {
    width: 166,
    height: 182,
  },
  text: {
    fontSize: 14,
    color: "#5F9FFF",
  },
  googleButton: {
    width: 267,
    height: 53,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
});

export default function Login() {
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [alreadyHasAccount, setAlreadyHasAccount] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Handle successful sign in
      console.log(userInfo);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Operation is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available or outdated");
      } else {
        console.log("Something went wrong:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {alreadyHasAccount ? (
            <>
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email address"
              />
              <TextInput
                secureTextEntry={true}
                style={styles.inputField}
                placeholder="Password"
                autoCapitalize="none"
              />
              <View style={{ marginBottom: 52 }}>
                <Button title="Sign In" onPress={() => {}} />
              </View>
              <Pressable onPress={() => setAlreadyHasAccount(false)}>
                <Text style={styles.text}>Other sign in methods</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.googleButton} onPress={signInWithGoogle}>
              <GoogleSigninButton />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
