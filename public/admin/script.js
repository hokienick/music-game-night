import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const errorMessageElement = document.getElementById("error-message"); // Error message element

    try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const roleDocRef = doc(db, "roles", user.uid);
        const roleDoc = await getDoc(roleDocRef);

        if (roleDoc.exists() && roleDoc.data().role === "admin") {
            // Redirect to Admin Dashboard if role is admin
            window.location.href = "admin-dashboard.html";
        } else {
            // User is not an admin
            errorMessageElement.textContent = "You do not have admin access.";
            errorMessageElement.style.display = "block";
        }
    } catch (error) {
        // Display error message on login failure
        console.error("Login failed:", error.message);

        // Show friendly error messages
        if (error.code === "auth/user-not-found") {
            errorMessageElement.textContent = "User not found. Please check your username.";
        } else if (error.code === "auth/wrong-password") {
            errorMessageElement.textContent = "Incorrect password. Please try again.";
        } else {
            errorMessageElement.textContent = "An error occurred. Please try again later.";
        }

        errorMessageElement.style.display = "block";
    }
});