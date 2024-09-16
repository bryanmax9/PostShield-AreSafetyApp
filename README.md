# PostShield
📊🏙️Area Safety App - Check others opinion on areas before going around and get to know new Spots thorugh the App

**PostShield** is a React Native application developed during the Headstarter fellowship. This app allows users to post about their current location, share experiences, and rate the area's safety based on the crime rate.

## Features

- **Map Integration**: Users can navigate the map and select a specific location or use their current location to create a post.
- **Post Creation**: Users can add a description of their experience and select a crime rate (Low, Medium, High) for the chosen location.
- **Crime Rate Calculation**: The app calculates an average crime rate based on user input and displays the overall safety of the area.
- **Data Storage**: Posts, images, and user credentials are stored using Firebase, ensuring real-time data retrieval.
- **Cross-Platform Compatibility**: The app is compatible with both mobile and web platforms, using MapView for mobile and Leaflet for web.
- **Geolocation**: The app uses the Nominatim API to fetch the exact address, latitude, longitude, city, and country of the selected location.

## Tech Stack

- **React Native**: For developing cross-platform mobile and web applications.
- **Firebase**: For storing images, user credentials, and location data.
- **Nominatim API**: To get the exact address, latitude, longitude, city, and country for each post.
- **MapView (React Native)**: For mobile map integration.
- **Leaflet**: For web map integration.

## Crime Rate Calculation (Will be Improved as Projec Scales)

Crime rate is calculated using the following logic:

1. Users select the crime rate as Low (1), Medium (2), or High (3).
2. The app aggregates crime ratings from all users for a specific location.
3. The average crime rate is calculated using the formula:

```bash
(Low * 1 + Medium * 2 + High * 3) / Total Number of Posts
```

For example, if 3 users select Low and 2 users select Medium:

```bash
(3 * 1) + (2 * 2) = 7
7 / 5 = 1.4, rounded down to 1 (Safe)
```

## Setup and Try App

1. Clone the repository:

```bash
git clone git@github.com:bryanmax9/PostShield-AreSafetyApp.git
```

2. cd to he project:

```bash
cd .\postshieldapp\
```

3. run:

```bash
npx expo start
```

## Required Dependencies to Install

Install MapBox

```bash
npx expo install react-native-maps

```

Insall for tabs:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

Install necessary peer dependencies:

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

Installing Icons:

```bash
npm install react-native-vector-icons

```

Dot Environment:

```bash
npm install react-native-dotenv

```

Install Expo location for Mobile support:

```bash
expo install expo-location
```

Installing Firebase for Authentication and Storing User's Post:

```bash
npm install firebase

```

Installing Image Picker for Users to pick image from gallery:

```bash
expo install expo-image-picker
```

Installing Stack Navigation and oher aditional dependencies:

```bash
npm install @react-navigation/stack
```

installing Navigation:

```bash
npm install @react-navigation/native
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

linking the dependencies:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

Install Firebase asnc o prersis User Sessions:

```bash
npm install @react-native-async-storage/async-storage

```

Installing Icons for UI of the WebApp:

```bash
npm install react-native-vector-icons
```

## Video DEMO

