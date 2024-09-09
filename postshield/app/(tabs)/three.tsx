import React from "react";
import { View, Text, StyleSheet, Image, Button } from "react-native";

const ThirdTabScreen = () => {
  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <Image
        source={{ uri: "https://via.placeholder.com/150" }} // Placeholder profile image
        style={styles.profileImage}
      />

      {/* User Name */}
      <Text style={styles.userName}>John Doe</Text>

      {/* User Bio */}
      <Text style={styles.userBio}>
        Software Engineer | Tech Enthusiast | Foodie. I love building cool apps
        and exploring the world of technology.
      </Text>

      {/* Profile Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>120</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>300</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>180</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <Button title="Edit Profile" onPress={() => {}} />
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9", // Light background color for profile section
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Makes the image round
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userBio: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
  },
});

export default ThirdTabScreen;
