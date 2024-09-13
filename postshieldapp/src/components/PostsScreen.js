import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);

  // Fetch all posts from Firestore when the screen loads
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts"); // Assuming your collection is named 'posts'
        const postSnapshot = await getDocs(postsCollection);
        const postsList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList); // Set posts to the state
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts(); // Call the fetchPosts function
  }, []);

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Text style={styles.title}>{item.location}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Image source={{ uri: item.photoUrl }} style={styles.postImage} />
              <Text style={styles.username}>Posted by: {item.username}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No posts available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  postContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  username: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
});
