import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Function to add a new post
export const addPost = async (userId, location, description, photoUrl) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      userId,
      location,
      description,
      photoUrl,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add post");
  }
};

// Function to fetch posts of a specific user
export const getUserPosts = async (userId) => {
  try {
    const q = query(collection(db, "posts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    let posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  } catch (e) {
    console.error("Error fetching user posts: ", e);
    throw new Error("Failed to fetch posts");
  }
};
