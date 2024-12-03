import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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
const eventDateInput = document.getElementById("event-date");
const locationDropdown = document.getElementById("location-dropdown");
const hostDropdown = document.getElementById("host-dropdown");
const musicUrlInput = document.getElementById("music-url");
const submitButton = document.getElementById("submit-game");
const errorMessage = document.getElementById("error-message");
const uploadErrorMessage = document.getElementById("upload-error-message");
const selectedDate = document.getElementById("selected-date");

// Helper function to validate Google Drive URLs
function validateGoogleDriveUrl(url) {
    const driveUrlPattern = /^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view\?usp=sharing$/;
    return driveUrlPattern.test(url);
}

// Convert Google Drive sharing URL to direct download URL
function convertToDownloadUrl(url) {
    const match = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view\?usp=sharing$/);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
    return null;
}

// Generate a 4-character alphanumeric code
function generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    return code;
}

// Populate dropdowns
// Populate dropdowns
async function loadDropdowns() {
    try {
        // Populate Locations
        const locationsSnapshot = await getDocs(collection(db, "locations"));
        locationsSnapshot.forEach((doc) => {
            const option = document.createElement("option");
            option.value = doc.id; // Save Firestore doc ID as value
            option.textContent = doc.data().name; // Display location name
            locationDropdown.appendChild(option);
        });

        // Populate Hosts
        const hostsSnapshot = await getDocs(collection(db, "hosts"));
        hostsSnapshot.forEach((doc) => {
            const option = document.createElement("option");
            option.value = doc.id; // Save Firestore doc ID as value
            option.textContent = doc.data().email; // Display host email
            hostDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading dropdowns:", error);
        errorMessage.textContent = "Error loading dropdown options.";
        errorMessage.style.display = "block";
    }
}

// Update selected date display
eventDateInput.addEventListener("change", () => {
    selectedDate.textContent = `Selected Date: ${eventDateInput.value}`;
});

// Submit game
submitButton.addEventListener("click", async () => {
    const date = eventDateInput.value;
    const locationId = locationDropdown.value; // Get the document ID
    const locationName = locationDropdown.options[locationDropdown.selectedIndex].textContent; // Get the displayed name
    const host = hostDropdown.value;
    const q1 = document.getElementById("q1").value;
    const q2 = document.getElementById("q2").value;
    const q3 = document.getElementById("q3").value;
    const q4 = document.getElementById("q4").value;
    const q5 = document.getElementById("q5").value;
    const musicUrl = musicUrlInput.value.trim(); // Ensure music URL is retrieved correctly

    // Clear previous error messages
    errorMessage.style.display = "none";
    uploadErrorMessage.style.display = "none";

    // Validate fields
    if (!date || !locationId || !host || !q1 || !q2 || !q3 || !q4 || !q5 || !musicUrl) {
        errorMessage.textContent = "All fields are required, including the music file URL.";
        errorMessage.style.display = "block";
        return;
    }

    // Validate and convert Google Drive URL
    if (!validateGoogleDriveUrl(musicUrl)) {
        uploadErrorMessage.textContent = "Invalid Google Drive URL. Please ensure it matches the format.";
        uploadErrorMessage.style.display = "block";
        return;
    }

    const musicFileURL = convertToDownloadUrl(musicUrl);
    if (!musicFileURL) {
        uploadErrorMessage.textContent = "Failed to generate a valid download link. Please try again.";
        uploadErrorMessage.style.display = "block";
        return;
    }

    // Generate a unique 4-character room code
    const roomCode = generateRoomCode();

    try {
        // Save game data in Firestore
        await addDoc(collection(db, "games"), {
            date,
            location: locationName, // Save the location name for display
            locationId, // Optionally save the Firestore document ID
            host,
            roomCode, // Save the room code
            finalRound: { q1, q2, q3, q4, q5 },
            musicFileURL, // Save the converted download link
            completed: false, // Ensure the completed field defaults to false
        });

        // Redirect on success
        window.location.href = "/admin/dashboard.html";
    } catch (error) {
        console.error("Error saving game:", error);
        errorMessage.textContent = "An error occurred while saving the game.";
        errorMessage.style.display = "block";
    }
});

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/login.html";
    } else {
        loadDropdowns();
    }
});