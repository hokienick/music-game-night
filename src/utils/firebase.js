// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9slaVzWlvolQ4eJVRiTrVpF9bF6XuRjI",
  authDomain: "music-game-night.firebaseapp.com",
  projectId: "music-game-night",
  storageBucket: "music-game-night.firebasestorage.app",
  messagingSenderId: "689144996552",
  appId: "1:689144996552:web:76278496579fb3f6c17bfd",
  measurementId: "G-17500V9PF8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);