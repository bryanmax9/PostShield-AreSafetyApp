import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, db } from "../firebaseConfig"; // Import Firebase auth and Firestore
import { signOutUser } from "../authService"; // Import the sign out function
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null); // State for the logged-in user
  const [posts, setPosts] = useState([]); // State for the user's posts
  const [loading, setLoading] = useState(true); // State to show loading spinner

  // Fetch current user and posts
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      setUser(currentUser);

      // Fetch user's posts from Firestore
      if (currentUser) {
        const q = query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(userPosts);
      }

      setLoading(false); // Stop the loading indicator
    };

    fetchUserData();
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      Alert.alert("Success", "You have signed out.");
      navigation.navigate("SignIn"); // Navigate back to sign-in screen
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  // Render the user's posts in a modern block layout
  const renderPost = ({ item }) => (
    <View style={styles.postBlock}>
      <Text style={styles.postText}>{item.description}</Text>
      <Text style={styles.postLocation}>{item.location}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {/* Profile Section */}
          {user && (
            <View style={styles.profileContainer}>
              <Image
                source={{
                  uri: user.photoURL || "https://example.com/placeholder.png", // Use user's photoURL or a placeholder
                }}
                style={styles.profileImage}
              />
              <Text style={styles.username}>
                {user.displayName || "Username"}
              </Text>
              <Text style={styles.email}>{user.email}</Text>
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                color="#0079d3"
              />

              {/* Dividing Line */}
              <View style={styles.divider} />
            </View>
          )}

          {/* User's Posts */}
          <Text style={styles.sectionTitle}>Your Posts</Text>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            style={styles.postsList}
            contentContainerStyle={styles.postsContent}
            ListEmptyComponent={() => (
              <Text style={styles.noPostsText}>
                You haven't posted anything yet.
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4", // Light background for modern look
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular shape
    marginBottom: 20,
    borderColor: "#ddd",
    borderWidth: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "flex-start",
  },
  postsList: {
    width: "100%",
  },
  postsContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  postBlock: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  postText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  postLocation: {
    fontSize: 14,
    color: "#888",
  },
  noPostsText: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    textAlign: "center",
  },
});
