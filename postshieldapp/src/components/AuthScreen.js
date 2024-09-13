import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Image,
  Alert,
  Platform,
} from "react-native";
import { signUp, signIn } from "../authService";
import * as ImagePicker from "expo-image-picker"; // For picking images
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [user, setUser] = useState(null);

  // Image picker handler
  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setProfileImage(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    }
  };

  // Handle signup with profile picture upload
  const handleSignUp = async () => {
    const newUser = await signUp(email, password);

    if (newUser && profileImage) {
      // Upload profile image to Firebase Storage
      try {
        const imageName = `profiles/${newUser.uid}-${Date.now()}.jpg`;
        const imageRef = ref(storage, imageName);
        const img = await fetch(profileImage);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        const imageUrl = await getDownloadURL(imageRef);

        console.log("Profile image uploaded:", imageUrl);
      } catch (error) {
        Alert.alert("Error", "Failed to upload profile image");
        console.error(error);
      }
    }

    setUser(newUser);
  };

  const handleSignIn = async () => {
    const existingUser = await signIn(email, password);
    setUser(existingUser);
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Pick Profile Image" onPress={handlePickImage} />
      {profileImage && (
        <Image
          source={{ uri: profileImage }}
          style={{ width: 100, height: 100 }}
        />
      )}
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
      {user && <Text>Welcome, {user.email}!</Text>}
    </View>
  );
}
