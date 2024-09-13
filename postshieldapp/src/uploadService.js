import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Platform } from "react-native"; // Ensure Platform is imported

// Function to upload profile image to Firebase Storage
export const uploadProfileImage = async (userId, profileImage) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${userId}`);

    let fileToUpload;

    // For web, directly use the file object
    if (Platform.OS === "web") {
      fileToUpload = profileImage.file; // Ensure we use the file object for web
    } else {
      // For mobile (expo), use the URI
      const response = await fetch(profileImage);
      fileToUpload = await response.blob();
    }

    // Upload the file (web or mobile) to Firebase Storage
    await uploadBytes(storageRef, fileToUpload, {
      contentType: profileImage.type || "image/jpeg", // Ensure correct MIME type
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Profile image uploaded successfully:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error.message);
    throw new Error("Failed to upload profile image");
  }
};
