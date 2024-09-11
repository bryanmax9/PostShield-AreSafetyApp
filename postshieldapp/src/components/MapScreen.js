import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  Button,
  Dimensions,
  PermissionsAndroid,
  Alert,
} from "react-native";
import Constants from "expo-constants";

// For web maps (using react-leaflet) - Only load for the web platform
let MapContainer, TileLayer, Marker, useMapEvents;

if (Platform.OS === "web") {
  MapContainer = require("react-leaflet").MapContainer;
  TileLayer = require("react-leaflet").TileLayer;
  Marker = require("react-leaflet").Marker;
  useMapEvents = require("react-leaflet").useMapEvents;
  require("leaflet/dist/leaflet.css");
}

let MapView = null; // MapView for mobile use only

// Fetch images from Unsplash
const fetchCityImages = async (city, setCityImages) => {
  const UNSPLASH_API_KEY = Constants.manifest.extra.UNSPLASH_API_KEY;
  const url = `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch images");
    const data = await response.json();
    const images = data.results.map((image) => image.urls.small);
    setCityImages(images);
  } catch (error) {
    console.error("Error fetching images from Unsplash:", error);
  }
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [cityImages, setCityImages] = useState([]);

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

      // Fetch city images
      fetchCityImages(city, setCityImages);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Request location permissions for Android
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs to access your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to display the map."
          );
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Load react-native-maps dynamically for mobile and request permission
  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps").then((module) => {
        MapView = module.default;
        requestLocationPermission(); // Request permission on mobile load
      });
    }
  }, []);

  // Mobile map press handler
  const onMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchLocationData(latitude, longitude);
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
            <ScrollView horizontal>
              {cityImages.length > 0 ? (
                cityImages.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.carouselImage}
                  />
                ))
              ) : (
                <Text>No images available for this city</Text>
              )}
            </ScrollView>
            <Button title="Post" onPress={() => alert("Post button clicked")} />
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
          // Web version using react-leaflet
          <MapContainer
            center={[37.7749, -122.4194]}
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
              />
            )}
            <MapClickHandler
              setSelectedLocation={setSelectedLocation}
              fetchLocationData={fetchLocationData}
            />
          </MapContainer>
        ) : (
          // Mobile version using react-native-maps
          MapView && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.mapMobile}
                initialRegion={{
                  latitude: 37.7749,
                  longitude: -122.4194,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={onMapPress}
              >
                {selectedLocation && (
                  <MapView.Marker coordinate={selectedLocation} />
                )}
              </MapView>
            </View>
          )
        )}
      </View>
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
    flexDirection: Platform.OS === "web" ? "row" : "column", // Web: row, Mobile: column
    flex: 1,
  },
  topContainer: {
    flex: 1, // Top half for details (mobile)
    padding: 20,
    justifyContent: "center",
  },
  rightContainer: {
    flex: 1, // Full map on the right for web
    height: "100%",
  },
  bottomContainer: {
    flex: 1, // Bottom half for mobile map
    justifyContent: "center", // Ensure the map is centered
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapMobile: {
    width: Dimensions.get("window").width, // Ensure map covers full width
    height: Dimensions.get("window").height / 2, // Take half of the screen height
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  carouselImage: {
    width: 300,
    height: 200,
    marginRight: 10,
  },
});
