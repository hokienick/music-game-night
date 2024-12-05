import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Menu Dropdown Toggle
const hamburgerMenu = document.getElementById("hamburger-menu");
const menuDropdown = document.getElementById("menu-dropdown");

hamburgerMenu.addEventListener("click", () => {
    menuDropdown.classList.toggle("hidden");
});

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
async function loadDropdowns() {
    try {
        // Populate Locations
        const locationsSnapshot = await getDocs(collection(db, "locations"));
        locationsSnapshot.forEach((doc) => {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = doc.data().name;
            locationDropdown.appendChild(option);
        });

        // Populate Hosts
        const hostsSnapshot = await getDocs(collection(db, "hosts"));
        hostsSnapshot.forEach((doc) => {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = doc.data().email;
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

// Validate inputs
function validateInputs() {
    const allInputs = document.querySelectorAll(".input-field");
    let isValid = true;

    allInputs.forEach((input) => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add("error-border");
        } else {
            input.classList.remove("error-border");
        }
    });

    return isValid;
}

// Submit game
submitButton.addEventListener("click", async () => {
    const date = eventDateInput.value;
    const locationId = locationDropdown.value;
    const locationName = locationDropdown.options[locationDropdown.selectedIndex]?.textContent || "";
    const host = hostDropdown.value;
    const musicUrl = musicUrlInput.value.trim();

    // Validate fields
    if (!validateInputs() || !date || !locationId || !host || !musicUrl) {
        errorMessage.textContent = "All fields are required.";
        errorMessage.style.display = "block";
        return;
    }

    // Validate and convert Google Drive URL
    if (!validateGoogleDriveUrl(musicUrl)) {
        uploadErrorMessage.textContent = "Invalid Google Drive URL. Please try again.";
        uploadErrorMessage.style.display = "block";
        return;
    }

    const musicFileURL = convertToDownloadUrl(musicUrl);

    // Gather rounds data
    const rounds = {};
    let questionNumber = 1; // Initialize sequential numbering for questions

    for (let round = 1; round <= 5; round++) {
        // Initialize the round object
        rounds[`round${round}`] = {};

        for (let question = 1; question <= 5; question++) {
            if (round === 1) {
                // Round 1: Only one text box per question
                const questionId = `round${round}-q${question}`;
                const questionInput = document.getElementById(questionId);

                if (questionInput) {
                    rounds[`round${round}`][`q${question}`] = questionInput.value.trim();
                } else {
                    console.warn(`Question Input with ID ${questionId} not found!`);
                }
            } else {
                // Rounds 2–5: Two text boxes per question (Artist and Title)
                const artistId = `round${round}-q${questionNumber}`;
                const titleId = `round${round}-q${questionNumber}-title`;
                const artistInput = document.getElementById(artistId);
                const titleInput = document.getElementById(titleId);

                if (artistInput && titleInput) {
                    // Save artist and title with sequential numbering
                    rounds[`round${round}`][`a${questionNumber}`] = artistInput.value.trim();
                    rounds[`round${round}`][`t${questionNumber}`] = titleInput.value.trim();
                } else {
                    console.warn(`Inputs for Artist (${artistId}) or Title (${titleId}) not found!`);
                }
            }

            questionNumber++; // Increment the sequential question number
        }
    }

    // Gather final question data
    const finalQuestion = {};
    for (let question = 1; question <= 4; question++) {
        const lyricInput = document.getElementById(`final-q${question}-lyric`);
        const wordsInput = document.getElementById(`final-q${question}-words`);
        finalQuestion[`q${question}`] = {
            lyric: lyricInput?.value.trim() || "",
            wordCount: wordsInput?.value.trim() || "",
        };
    }

    try {
        // Save game data in Firestore
        await addDoc(collection(db, "games"), {
            date,
            location: locationName,
            locationId,
            host,
            roomCode: generateRoomCode(),
            musicFileURL,
            rounds,
            finalQuestion,
            completed: false,
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