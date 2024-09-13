// src/firestoreTest.js
import { db } from "./firebaseConfig"; // Import your firebaseConfig file
import { doc, setDoc } from "firebase/firestore";

export const testFirestoreWrite = async () => {
  try {
    // Test Firestore write
    await setDoc(doc(db, "testCollection", "testDoc"), {
      testField: "Hello, Firestore!",
      timestamp: new Date().toISOString(),
    });
    console.log("Firestore write successful!");
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
};
