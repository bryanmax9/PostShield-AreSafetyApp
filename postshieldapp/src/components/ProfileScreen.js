import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  Platform,
} from "react-native";
import { auth, db } from "../firebaseConfig"; // Import Firebase auth and Firestore
import { signOutUser } from "../authService"; // Import the sign out function
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

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
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          if (userData.posts && userData.posts.length > 0) {
            setPosts(userData.posts); // Set user's posts
          }
        }
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
    <View style={styles.postContainer}>
      <Text style={styles.title}>{item.location}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </View>
  );

  // Load more posts when the user scrolls down
  const handleLoadMore = () => {
    if (!loading && posts.length > 0) {
      setLoading(true);
      // Simulate loading more content or fetching additional posts
      setTimeout(() => {
        setLoading(false); // Simulate end of load more action
      }, 1500); // Adjust delay if needed
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0079d3" />
      ) : (
        <>
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

              {/* Sign-Out Button */}
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                color="#0079d3"
              />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Your Posts</Text>
            </View>
          )}

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item, index) => index.toString()} // Use index as key if no unique id
            style={styles.flatListContainer}
            contentContainerStyle={styles.flatListContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.01} // Smaller threshold to delay the update
            ListFooterComponent={<View style={{ height: 200 }} />} // Add more space to indicate scrolling
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
  flatListContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 100,
    paddingHorizontal: Platform.OS === "web" ? "20%" : "5%",
  },
  postContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#ddd",
    width: Platform.OS === "web" ? "80%" : "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  postImage: {
    height: 200,
    borderRadius: 8,
    width: "100%",
  },
  noPostsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
