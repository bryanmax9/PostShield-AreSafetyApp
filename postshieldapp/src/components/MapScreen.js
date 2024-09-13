import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  StyleSheet,
  Text,
  Button,
  Dimensions,
  PermissionsAndroid,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker"; // Import image picker
import { db, storage } from "../firebaseConfig"; // Import Firestore and Storage
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { doc, updateDoc, arrayUnion } from "firebase/firestore"; // For updating Firestore

// Dynamic import variables for maps
let MapView, Marker;

// For web maps (using react-leaflet)
let MapContainer, TileLayer, useMapEvents, L;

if (Platform.OS === "web") {
  MapContainer = require("react-leaflet").MapContainer;
  TileLayer = require("react-leaflet").TileLayer;
  Marker = require("react-leaflet").Marker;
  useMapEvents = require("react-leaflet").useMapEvents;
  L = require("leaflet"); // Import Leaflet for web
  require("leaflet/dist/leaflet.css");
}

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false); // State to track if MapView is loaded for mobile
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [description, setDescription] = useState(""); // Post description
  const [image, setImage] = useState(null); // Image state for selected photo

  // Fetch geolocation data using Nominatim API
  const fetchLocationData = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const city = data.address.city || "Unknown City";
      const country = data.address.country || "Unknown Country";
      const address = data.display_name || "No address available";

      setLocationData({
        city,
        country,
        address,
      });
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Request location permissions for Android and Web
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to display the map."
          );
          return;
        }
        getCurrentLocationMobile(); // Get current location for mobile devices
      } else {
        getCurrentLocationWeb(); // Get current location for web browsers
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Get current location using expo-location for mobile
  const getCurrentLocationMobile = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setSelectedLocation({ latitude, longitude });
      fetchLocationData(latitude, longitude);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location");
      console.error(error);
    }
  };

  // Get current location using the geolocation API for web
  const getCurrentLocationWeb = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setSelectedLocation({ latitude, longitude });
          fetchLocationData(latitude, longitude);
        },
        (error) => {
          Alert.alert("Error", "Unable to fetch location");
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
      Alert.alert("Error", "Geolocation is not supported by your browser");
    }
  };

  // Dynamically load react-native-maps only for mobile platforms
  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps").then((module) => {
        MapView = module.default;
        Marker = module.Marker;
        requestLocationPermission(); // Request permission on mobile load
        setMapLoaded(true); // Mark map as loaded
      });
    } else {
      requestLocationPermission(); // Web: request current location
    }
  }, []);

  // Mobile map press handler
  const onMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchLocationData(latitude, longitude);
  };

  // Handle image selection
  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      // For web, use the HTML file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setImage(reader.result); // Set the image as base64 URL
          };
          reader.readAsDataURL(file); // Read the file as a Data URL
        }
      };
      input.click();
    } else {
      // For mobile (iOS and Android), use expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri); // Set the image URI correctly
      }
    }
  };

  // Handle creating a new post for the signed-in user
  const handleCreatePost = async () => {
    const auth = getAuth(); // Get Firebase Auth instance
    const user = auth.currentUser; // Get the current user

    if (!user) {
      Alert.alert("Error", "No user is signed in");
      return;
    }

    if (description && image && selectedLocation) {
      try {
        // Upload image to Firebase Storage
        const imageName = `images/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;
        const imageRef = ref(storage, imageName);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);

        // Get the download URL after upload
        const imageUrl = await getDownloadURL(imageRef);

        // Prepare the post object
        const newPost = {
          location: locationData.address || "Unknown Location",
          description,
          imageUrl,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        };

        // Add the post to the authenticated user's 'posts' array in Firestore
        const userDoc = doc(db, "users", user.uid);
        await updateDoc(userDoc, {
          posts: arrayUnion(newPost), // Append new post to the 'posts' array
        });

        Alert.alert("Success", "Post added successfully!");
        setModalVisible(false); // Close modal after adding post
        setDescription(""); // Reset input fields
        setImage(null);
      } catch (error) {
        Alert.alert("Error", "Failed to add post");
        console.error("Error adding post: ", error);
      }
    } else {
      Alert.alert("Error", "All fields are required");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top container for details */}
      <View style={styles.topContainer}>
        {locationData ? (
          <>
            <Text style={styles.title}>
              {locationData.city}, {locationData.country}
            </Text>
            <Text style={styles.subtitle}>{locationData.address}</Text>
            {/* Show post button */}
            <Button title="Post" onPress={() => setModalVisible(true)} />
          </>
        ) : (
          <Text>Select a location on the map to view details</Text>
        )}
      </View>

      {/* Map container */}
      <View
        style={
          Platform.OS === "web" ? styles.rightContainer : styles.bottomContainer
        }
      >
        {Platform.OS === "web" ? (
          <MapContainer
            center={currentLocation || [37.7749, -122.4194]}
            zoom={13}
            style={styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedLocation && (
              <Marker
                position={[
                  selectedLocation.latitude,
                  selectedLocation.longitude,
                ]}
                icon={L.icon({
                  iconUrl: "/assets/map.png",
                  iconSize: [38, 38],
                  iconAnchor: [19, 38],
                })}
              />
            )}
            <MapClickHandler
              setSelectedLocation={setSelectedLocation}
              fetchLocationData={fetchLocationData}
            />
          </MapContainer>
        ) : (
          mapLoaded &&
          MapView && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.mapMobile}
                region={
                  currentLocation
                    ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }
                    : undefined
                }
                onPress={onMapPress}
              >
                {selectedLocation && (
                  <Marker coordinate={selectedLocation}>
                    <Image
                      source={require("../../assets/map.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </Marker>
                )}
              </MapView>
            </View>
          )
        )}
      </View>

      {/* Modal for creating a new post */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a Post</Text>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <Button title="Pick an Image" onPress={handlePickImage} />
          {image && (
            <Image
              source={{ uri: image }} // Use the `image` state which is either a base64 string (web) or URI (mobile)
              style={{ width: 100, height: 100 }} // Adjust width and height to match your layout
            />
          )}

          <Button title="Submit Post" onPress={handleCreatePost} />
          <Button
            title="Cancel"
            onPress={() => setModalVisible(false)}
            color="red"
          />
        </View>
      </Modal>
    </View>
  );
}

// Web map click handler
const MapClickHandler = ({ setSelectedLocation, fetchLocationData }) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      setSelectedLocation({ latitude: lat, longitude: lng });
      fetchLocationData(lat, lng);
    },
  });
  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flex: 1,
  },
  topContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  rightContainer: {
    flex: 1,
    height: "100%",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapMobile: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
});
