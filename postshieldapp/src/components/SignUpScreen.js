import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Text,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { signUp } from "../authService";
import * as ImagePicker from "expo-image-picker";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username || !profileImage) {
      setErrorMessage("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      setErrorMessage("");
      await signUp(email, password, username, profileImage);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("SignIn");
    } catch (error) {
      setErrorMessage("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickImageMobile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const pickImageWeb = () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          setProfileImage({ file, type: file.type });
        }
      };
      input.click();
    } catch (error) {
      console.error("Error selecting file:", error.message);
    }
  };

  const pickImage = () => {
    if (Platform.OS === "web") {
      pickImageWeb();
    } else {
      pickImageMobile();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Sign Up</Text>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {/* Profile Image Picker */}
          <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
            <Text style={styles.pickImageText}>Pick Profile Image</Text>
          </TouchableOpacity>

          {profileImage && (
            <Image
              source={{
                uri:
                  Platform.OS === "web"
                    ? URL.createObjectURL(profileImage.file)
                    : profileImage,
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          )}

          {/* Input Fields */}
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errorMessage) setErrorMessage("");
            }}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage("");
            }}
            style={styles.input}
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage("");
            }}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />

          {/* Sign Up Button */}
          <Button title="Sign Up" onPress={handleSignUp} color="#202020" />

          {/* Already have an account link */}
          <Text style={styles.registerLink}>
            Already have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("SignIn")}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4e5c4",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    backgroundColor: "#f4e5c4",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    marginBottom: 10,
  },
  pickImageButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#202020",
    borderRadius: 5,
  },
  pickImageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 10,
  },
  registerLink: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#202020",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
