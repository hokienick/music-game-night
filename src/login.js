import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
console.log("login.js loaded");
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

// Login functionality
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User logged in:", userCredential.user);
            window.location.href = "/admin/dashboard.html";
        })
        .catch((error) => {
            console.error("Error logging in:", error.message);
            document.getElementById("error-message").textContent = "Invalid login credentials.";
            document.getElementById("error-message").style.display = "block";
        });
});