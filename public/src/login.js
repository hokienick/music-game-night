// Import Firebase modules (make sure these match the Firebase version you're using)
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyA9slaVzWlvolQ4eJVRiTrVpF9bF6XuRjI",
    authDomain: "music-game-night.firebaseapp.com",
    projectId: "music-game-night",
    storageBucket: "music-game-night.firebasestorage.app",
    messagingSenderId: "689144996552",
    appId: "1:689144996552:web:76278496579fb3f6c17bfd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add an event listener to the login form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent the form from submitting traditionally

    // Get user input
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Attempt to sign in with Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Login successful:", userCredential.user);

        // Redirect to the dashboard
        window.location.href = "/admin/dashboard.html";
      })
      .catch((error) => {

        // Map Firebase error codes to user-friendly messages
        let userFriendlyMessage;
        switch (error.code) {
          case "auth/invalid-email":
            userFriendlyMessage = "Invalid email address. Please check and try again.";
            break;
          case "auth/user-not-found":
            userFriendlyMessage = "No user found with this email. Please sign up or try a different email.";
            break;
          case "auth/wrong-password":
            userFriendlyMessage = "Incorrect password. Please try again.";
            break;
          case "auth/too-many-requests":
            userFriendlyMessage = "Too many failed attempts. Please try again later.";
            break;
          case "auth/invalid-credential":
            userFriendlyMessage =
              "Invalid credential detected.";
            break;
          default:
            userFriendlyMessage = "An unexpected error occurred. Please try again.";
            break;
        }

        // Display error message
        errorMessage.textContent = userFriendlyMessage;
        errorMessage.style.display = "block";
        console.error("Login failed:", error);
      });
  });
});