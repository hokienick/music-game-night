import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
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
const db = getFirestore(app);

// DOM Elements
const logoutButton = document.getElementById("logout-button");
const gamesTableBody = document.querySelector(".games-table tbody");

// Populate games table
async function loadGames(hostEmail) {
    try {
        // Query games where the host matches the logged-in user's email
        const gamesQuery = query(collection(db, "games"), where("host", "==", hostEmail));
        const querySnapshot = await getDocs(gamesQuery);

        gamesTableBody.innerHTML = ""; // Clear any existing rows

        querySnapshot.forEach((doc) => {
            const game = doc.data();

            // Create a new row for each game
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${game.date}</td>
                <td>${game.location}</td>
                <td>${game.roomCode}</td>
                <td><a href="${game.musicFileURL}" target="_blank">📥</a></td>
            `;
            gamesTableBody.appendChild(row);
        });

        if (querySnapshot.empty) {
            // Display a message if no games are found
            const noGamesRow = document.createElement("tr");
            noGamesRow.innerHTML = `<td colspan="4">No games assigned to you.</td>`;
            gamesTableBody.appendChild(noGamesRow);
        }
    } catch (error) {
        console.error("Error loading games:", error);
    }
}

// Logout functionality
logoutButton.addEventListener("click", () => {
    auth.signOut()
        .then(() => {
            console.log("Logout successful. Redirecting to login page...");
            window.location.href = "/login.html"; // Redirect to login page
        })
        .catch((error) => {
            console.error("Logout failed:", error);
            alert("An error occurred while logging out. Please try again.");
        });
});

// Check authentication and load games
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("User not authenticated. Redirecting to login page...");
        window.location.href = "/login.html"; // Redirect to login page
    } else {
        console.log(`User authenticated: ${user.email}`);
        loadGames(user.email); // Load games for the logged-in host
    }
});