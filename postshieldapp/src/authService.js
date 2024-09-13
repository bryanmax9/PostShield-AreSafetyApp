import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { uploadProfileImage } from "./uploadService"; // Import the upload function

// Sign Up Function with profile image
export const signUp = async (email, password, username, profileImageUri) => {
  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Upload the profile image to Firebase Storage (if provided)
    let profileImageUrl = "";
    if (profileImageUri) {
      profileImageUrl = await uploadProfileImage(user.uid, profileImageUri);
    }

    // Update the user's profile in Firebase Authentication
    await updateProfile(user, {
      displayName: username,
      photoURL: profileImageUrl || null, // Set the photo URL in the Firebase Auth profile
    });

    // Save the user's profile in Firestore, including an empty 'posts' array
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      profileImageUrl: profileImageUrl || "", // Store the download URL in Firestore
      createdAt: new Date().toISOString(),
      posts: [], // Add an empty list of posts
    });

    console.log("User signed up successfully with profile:", user);
    return user;
  } catch (error) {
    console.error("Sign Up Error:", error.message);
    throw new Error(error.message); // Throw the error to be caught in the UI
  }
};

// Sign In Function with error handling
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Sign In Error:", error.message);
    throw new Error("Invalid email or password. Please try again.");
  }
};

// Sign Out Function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Sign Out Error:", error.message);
  }
};
