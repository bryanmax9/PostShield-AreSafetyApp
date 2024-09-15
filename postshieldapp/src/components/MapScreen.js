import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  collection,
} from "firebase/firestore";

let MapView, Marker, MapContainer, TileLayer, L, useMapEvents;

if (Platform.OS === "web") {
  MapContainer = require("react-leaflet").MapContainer;
  TileLayer = require("react-leaflet").TileLayer;
  Marker = require("react-leaflet").Marker;
  useMapEvents = require("react-leaflet").useMapEvents;
  L = require("leaflet");
  require("leaflet/dist/leaflet.css");
}

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [crimeLevel, setCrimeLevel] = useState("");
  const [averageCrimeLevel, setAverageCrimeLevel] = useState("Not enough data");

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

      // Fetch posts for the selected location and calculate the average crime level
      await fetchPostsForLocation(lat, lng);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Fetch posts for the selected location and calculate average crime level
  const fetchPostsForLocation = async (lat, lng) => {
    try {
      const postsRef = collection(db, "users");
      const querySnapshot = await getDocs(postsRef);
      let totalCrimeLevel = 0;
      let totalPosts = 0;

      querySnapshot.forEach((doc) => {
        const posts = doc.data().posts || [];
        posts.forEach((post) => {
          const latDiff = Math.abs(post.latitude - lat) < 0.005;
          const lngDiff = Math.abs(post.longitude - lng) < 0.005;

          // Compare lat/lng with tolerance for precision
          if (latDiff && lngDiff) {
            totalPosts++;
            console.log(`Post found at: ${post.latitude}, ${post.longitude}`);

            if (post.crimeLevel === "low") totalCrimeLevel += 1;
            else if (post.crimeLevel === "medium") totalCrimeLevel += 2;
            else if (post.crimeLevel === "high") totalCrimeLevel += 3;
          }
        });
      });

      if (totalPosts > 0) {
        const avg = totalCrimeLevel / totalPosts;
        console.log(`Total Posts: ${totalPosts}, Average Crime Level: ${avg}`);
        if (avg <= 1.3) setAverageCrimeLevel("low");
        else if (avg <= 2.3) setAverageCrimeLevel("medium");
        else setAverageCrimeLevel("high");
      } else {
        setAverageCrimeLevel("Not enough data");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

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
        getCurrentLocationMobile();
      } else {
        getCurrentLocationWeb();
      }
    } catch (err) {
      console.warn(err);
    }
  };

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

  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps").then((module) => {
        MapView = module.default;
        Marker = module.Marker;
        requestLocationPermission();
        setMapLoaded(true);
      });
    } else {
      requestLocationPermission();
    }
  }, []);

  const onMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchLocationData(latitude, longitude);
  };

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
            setImage(reader.result);
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
        setImage(result.assets[0].uri);
      }
    }
  };

  const CustomButton = ({ title, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: backgroundColor || "#2D3E3E" }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor || "#fff" }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const handleCreatePost = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user is signed in");
      return;
    }

    if (description && image && selectedLocation && crimeLevel) {
      try {
        console.log("Starting image upload...");

        const imageName = `images/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;
        const imageRef = ref(storage, imageName);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);

        const imageUrl = await getDownloadURL(imageRef);
        console.log("Image uploaded successfully, URL:", imageUrl);

        const newPost = {
          location: locationData?.address || "Unknown Location",
          description,
          imageUrl,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          crimeLevel,
        };

        console.log("Saving post to Firestore...");
        const userDoc = doc(db, "users", user.uid);
        await updateDoc(userDoc, {
          posts: arrayUnion(newPost),
        });

        Alert.alert("Success", "Post added successfully!");
        console.log("Post added successfully!");

        setModalVisible(false);
        setDescription("");
        setImage(null);
        setCrimeLevel("");
      } catch (error) {
        Alert.alert("Error", "There was a problem posting. Please try again.");
        console.error("Error adding post: ", error);
      }
    } else {
      Alert.alert("Error", "All fields are required");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        {locationData ? (
          <>
            <Text style={styles.title}>
              {locationData.city}, {locationData.country}
            </Text>
            <Text style={styles.subtitle}>{locationData.address}</Text>
            <Text style={styles.crimeStatus}>
              Crime Level:{" "}
              {averageCrimeLevel === "low"
                ? "Low (Green)"
                : averageCrimeLevel === "medium"
                ? "Medium (Yellow)"
                : averageCrimeLevel === "high"
                ? "High (Red)"
                : "Not enough data"}
            </Text>
            <CustomButton
              title="Post"
              onPress={() => setModalVisible(true)}
              backgroundColor="#2D3E3E"
              textColor="#E9D8A6"
            />
          </>
        ) : (
          <Text>Select a location on the map to view details</Text>
        )}
      </View>

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
          )
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a Post</Text>
          <TextInput
            style={styles.input}
            value={description}
            placeholder="Describe your Experience!"
            placeholderTextColor="#999"
            onChangeText={setDescription}
          />
          <Text style={styles.label}>Select Crime Level</Text>
          <View style={styles.crimeLevelContainer}>
            <TouchableOpacity
              style={[
                styles.crimeLevelButton,
                crimeLevel === "low" && styles.selectedButton,
              ]}
              onPress={() => setCrimeLevel("low")}
            >
              <Text style={styles.buttonText}>Low (Green)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.crimeLevelButton,
                crimeLevel === "medium" && styles.selectedButton,
              ]}
              onPress={() => setCrimeLevel("medium")}
            >
              <Text style={styles.buttonText}>Medium (Yellow)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.crimeLevelButton,
                crimeLevel === "high" && styles.selectedButton,
              ]}
              onPress={() => setCrimeLevel("high")}
            >
              <Text style={styles.buttonText}>High (Red)</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="Pick an Image"
            onPress={handlePickImage}
            backgroundColor="#4CAF50"
          />

          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200, marginTop: 8 }}
            />
          )}

          <CustomButton
            title="Submit Post"
            onPress={handleCreatePost}
            backgroundColor="#2D3E3E"
            textColor="#E9D8A6"
          />
          <CustomButton
            title="Cancel"
            onPress={() => setModalVisible(false)}
            backgroundColor="#FF6347"
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

const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flex: 1,
    backgroundColor: "#f4e5c4",
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
  crimeLevelContainer: {
    flexDirection: screenWidth < 400 ? "column" : "row", // Stack buttons vertically on smaller screens
    justifyContent: screenWidth < 400 ? "center" : "space-around",
    alignItems: "center", // Ensure buttons are centered in the container
    marginVertical: 10,
  },
  crimeLevelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: screenWidth < 400 ? 0 : 10, // Smaller horizontal margin for small screens
    marginVertical: screenWidth < 400 ? 5 : 0, // Add vertical margin for stacked buttons on small screens
    backgroundColor: "#ccc",
    borderRadius: 8,
    minWidth: 120, // Ensure buttons have a consistent width for alignment
    textAlign: "center", // Align text centrally
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    padding: 5,
  },
  selectedButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  crimeStatus: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  modalContainer: {
    backgroundColor: "#f4e5c4",
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
    borderColor: "#2D3E3E",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    color: "#333",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
