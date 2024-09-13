import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Text,
  Alert,
} from "react-native";
import { signIn } from "../authService";

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to hold error messages

  const handleSignIn = async () => {
    try {
      // Clear the error message when attempting to sign in again
      setErrorMessage("");

      // Attempt to sign in the user
      await signIn(email, password);

      // Navigate to Home after successful sign-in
      navigation.navigate("Posts"); // Or "Profile" or wherever you want
    } catch (error) {
      // Set error message based on Firebase auth error codes
      let errorMsg;
      switch (error.code) {
        case "auth/user-not-found":
          errorMsg = "No user found with this email.";
          break;
        case "auth/wrong-password":
          errorMsg = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMsg = "The email address is badly formatted.";
          break;
        default:
          errorMsg = "An error occurred. Please try again.";
      }
      setErrorMessage(errorMsg); // Set the error message to be displayed in red
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Sign In</Text>

      {/* Show error message if sign-in fails */}
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errorMessage) setErrorMessage(""); // Clear error when user starts typing
        }}
        style={styles.input}
        placeholderTextColor="#888" // Set a darker placeholder color for better visibility
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errorMessage) setErrorMessage(""); // Clear error when user starts typing
        }}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888" // Set a darker placeholder color for better visibility
      />
      <Button title="Sign In" onPress={handleSignIn} color="#202020" />

      <Text style={styles.registerLink}>
        New to the app?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4e5c4",
  },
  logo: {
    width: 200, // Increase width to desired size
    height: 200, // Increase height to desired size
  },
  title: {
    marginTop: -40,
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#000", // Darker border for clearer input field
    borderRadius: 5,
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  registerLink: {
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: "#202020",
    fontWeight: "bold",
  },
});
