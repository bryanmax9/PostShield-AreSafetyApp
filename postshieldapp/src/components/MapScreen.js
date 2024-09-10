import React, { useEffect, useState } from "react";
import { View, Platform, StyleSheet, Text } from "react-native";

export default function MapScreen() {
  const [MapView, setMapView] = useState(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Dynamically import react-native-maps for mobile platforms
      import("react-native-maps").then((module) =>
        setMapView(() => module.default)
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        // Web Map using react-leaflet
        <iframe
          width="100%"
          height="100%"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-0.09%2C51.5%2C-0.09%2C51.505"
          title="OpenStreetMap"
        ></iframe>
      ) : (
        // Mobile Map using react-native-maps (only loaded if on mobile)
        MapView && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
