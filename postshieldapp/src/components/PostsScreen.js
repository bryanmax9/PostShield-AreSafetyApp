import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome"; // Import magnifier icon

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [page, setPage] = useState(1);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      let allPosts = [];
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.posts && userData.posts.length > 0) {
          userData.posts.forEach((post) => {
            allPosts.push({
              id: `${userDoc.id}-${post.description}`, // Unique identifier
              username: userData.username,
              profileImageUrl: userData.profileImageUrl,
              ...post,
            });
          });
        }
      });

      setPosts(allPosts);
      setFilteredPosts(allPosts); // Set the full list
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchText.trim()) {
      const searchWords = searchText.toLowerCase().split(" ");
      const filtered = posts.filter((post) => {
        const locationWords = post.location.toLowerCase();
        const descriptionWords = post.description.toLowerCase();
        return searchWords.every(
          (word) =>
            locationWords.includes(word) || descriptionWords.includes(word)
        );
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts); // Reset to all posts if no search input
    }
  }, [searchText, posts]);

  const handleLoadMore = () => {
    if (!loading) {
      setLoading(true);
      setPage((prevPage) => prevPage + 1);
      fetchPosts();
    }
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#999"
          style={styles.magnifierIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts by location or description..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0079d3" />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.headerContainer}>
                <Image
                  source={{ uri: item.profileImageUrl }}
                  style={styles.profileImage}
                />
                <Text style={styles.username}>{item.username}</Text>
              </View>
              <Text style={styles.title}>{item.location}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            </View>
          )}
          contentContainerStyle={styles.flatListContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={<View style={{ height: 350 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 20 : 10,
    backgroundColor: "#f4e5c4",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginHorizontal: "5%",
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  magnifierIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  flatListContainer: {
    paddingBottom: 100,
    paddingHorizontal: "5%",
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
    width: Platform.OS === "web" ? "80%" : "90%",
    maxWidth: 600,
    alignSelf: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
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
});
