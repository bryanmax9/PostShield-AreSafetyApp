import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import PostsScreen from "./src/components/PostsScreen";
import MapScreen from "./src/components/MapScreen";
import ProfileScreen from "./src/components/ProfileScreen";
import SignInScreen from "./src/components/SignInScreen";
import SignUpScreen from "./src/components/SignUpScreen";
import { auth } from "./src/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { View, Text, ActivityIndicator } from "react-native";
//import { testFirestoreWrite } from "./src/firestoreTest"; // Import the test function

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  // This was only to test that FireStore is working properly💀🫠
  // useEffect(() => {
  //   // Call Firestore write test on app load
  //   testFirestoreWrite();
  // }, []);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // Tab Navigator for authenticated users
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === "Posts") {
                iconName = "list-outline";
              } else if (route.name === "Map") {
                iconName = "map-outline";
              } else if (route.name === "Profile") {
                iconName = "person-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen name="Posts" component={PostsScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        // Stack Navigator for unauthenticated users
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2D3E3E", // Military green color for the header
            },
            headerTintColor: "#E9D8A6", // Beige color for the text/icons
            headerTitleStyle: {
              fontWeight: "bold", // Optionally, make the text bold
            },
          }}
          initialRouteName="SignIn"
        >
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: "Sign In" }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: "Sign Up" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
