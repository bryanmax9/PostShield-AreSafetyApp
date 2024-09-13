import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyAKX30I1FQgbqP4AfbpzaWrz4NEXHNMpmo",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "postshield.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "postshield",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "postshield.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "396690845781",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:396690845781:web:986f14c99afb5aac1f24dc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Verify Firebase initialization with a console log
console.log("Firebase initialized:", app.name);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
