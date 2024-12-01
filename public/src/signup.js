import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9slaVzWlvolQ4eJVRiTrVpF9bF6XuRjI",
    authDomain: "music-game-night.firebaseapp.com",
    projectId: "music-game-night",
    storageBucket: "music-game-night.firebasestorage.app",
    messagingSenderId: "689144996552",
    appId: "1:689144996552:web:76278496579fb3f6c17bfd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupButton = document.getElementById("signup-button");
const errorContainer = document.getElementById("error-message");

// Pre-fill the email field (from query parameters)
const params = new URLSearchParams(window.location.search);
const prefilledEmail = params.get("email");
if (prefilledEmail) {
    emailInput.value = decodeURIComponent(prefilledEmail);
    emailInput.disabled = true; // Disable editing
}

// Signup Event Listener
signupButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear any previous error messages
    errorContainer.textContent = "";

    if (!password) {
        errorContainer.textContent = "Please enter a password.";
        return;
    }

    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Assign "host" role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "host",
            createdAt: new Date().toISOString(),
        });

        // Update host status to "Completed" in Firestore
        const hostRef = doc(db, "hosts", email);
        await updateDoc(hostRef, { status: "Completed" });

        // Redirect to Host Dashboard on success
        window.location.href = "/host/host-dashboard.html";
    } catch (error) {
        console.error("Error during signup:", error);

        // Display error message under the "Sign Up" button
        errorContainer.textContent = `Signup failed: ${error.message}`;
    }
});