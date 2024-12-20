import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("hamburger-menu");
    const menuDropdown = document.getElementById("menu-dropdown");
    const logoutButton = document.getElementById("logout-button");
    const toggleCompleted = document.getElementById("toggle-completed");
    const tableBody = document.querySelector(".games-table tbody");
    const createGameButton = document.getElementById("create-game");

    // Check if the user is authenticated
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("User not authenticated. Redirecting to login page...");
            window.location.href = "/login.html"; // Redirect to login
        } else {
            console.log(`User authenticated: ${user.email}`);
            await loadGames(); // Load games dynamically from Firestore
        }
    });

    // Toggle menu visibility
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent this click from triggering the outside click handler
        menuDropdown.classList.toggle("hidden");
    });

    // Close the menu when clicking outside of it
    document.addEventListener("click", (event) => {
        if (!menuDropdown.contains(event.target) && event.target !== menuButton) {
            menuDropdown.classList.add("hidden");
        }
    });

    // Logout functionality
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior
        auth.signOut()
            .then(() => {
                console.log("Logout successful. Redirecting to login page...");
                window.location.href = "/login.html"; // Redirect to login after logout
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                alert("An error occurred while logging out. Please try again.");
            });
    });

    // Show/Hide completed rows
    toggleCompleted.addEventListener("change", (e) => {
        const hideCompleted = e.target.checked;

        Array.from(tableBody.rows).forEach((row) => {
            const completedCheckbox = row.querySelector(".completed-checkbox");

            if (completedCheckbox.checked) {
                row.style.display = hideCompleted ? "none" : "";
            }
        });
    });

    // Redirect to Create Game page when the button is clicked
    createGameButton.addEventListener("click", () => {
        console.log("Navigating to Create Game page...");
        window.location.href = "/admin/create-game.html";
    });

    // Load games from Firestore and populate the table
    async function loadGames() {
        try {
            const gamesSnapshot = await getDocs(collection(db, "games"));
            gamesSnapshot.forEach((doc) => {
                const game = doc.data();
                const roomCode = game.roomCode; // Get the roomCode
                console.log("Fetched Room Code:", roomCode);
                addGameToTable(game, roomCode);
            });
        } catch (error) {
            console.error("Error loading games:", error);
        }
    }

    // Add a game to the table
    function addGameToTable(game, roomCode) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${game.date}</td>
            <td>${game.location}</td>
            <td>${game.roomCode}</td>
            <td>${game.host}</td>
            <td><a href="${game.musicFileURL}" download target="_blank">📥</a></td>
            <td><input type="checkbox" class="completed-checkbox"></td>
            <td>
                ${
                    game.completed
                        ? ""
                        : `<button class="launch-button" data-id="${roomCode}">Launch</button>`
                }
            </td>
            <td><button class="btn-remove-dashboard" data-id="${roomCode}">Remove</button></td>
        `;

        // Add event listener for the "Completed" checkbox
        const completedCheckbox = row.querySelector(".completed-checkbox");
        completedCheckbox.addEventListener("change", () => {
            if (toggleCompleted.checked && completedCheckbox.checked) {
                row.style.display = "none"; // Hide row if "Hide Completed" is checked
            } else {
                row.style.display = ""; // Show row otherwise
            }
        });

        // Add event listener for the "Remove" button
        const removeButton = row.querySelector(".btn-remove-dashboard");
        
        removeButton.addEventListener("click", async () => {
            const roomCode = removeButton.dataset.id;
            const confirmDelete = confirm("Are you sure you want to delete this game?");
            if (confirmDelete) {
                try {
                    // Fetch the document ID (gameId) using roomCode
                    const gamesQuery = collection(db, "games");
                    const querySnapshot = await getDocs(gamesQuery);
                    let gameIdToDelete = null;

                    querySnapshot.forEach((doc) => {
                        if (doc.data().roomCode === roomCode) {
                            gameIdToDelete = doc.id;
                        }
                    });

                    if (gameIdToDelete) {
                        // Remove from Firestore using gameId
                        await deleteDoc(doc(db, "games", gameIdToDelete));
                        // Remove from table
                        row.remove();
                        console.log(`Game with ID ${gameIdToDelete} (Room Code: ${roomCode}) removed successfully.`);
                    } else {
                        console.error("Document with specified roomCode not found");
                        alert("Failed to remove the game: Room Code not found.");
                    }
                } catch (error) {
                    console.error("Error removing game:", error);
                    alert("Failed to remove the game. Please try again.");
                }
            }
        });

        // Add event listener for the "Launch" button
        const launchButton = row.querySelector(".launch-button");
        if (launchButton) {
            launchButton.addEventListener("click", () => {
                // Redirect to Command Center with roomCode in query string
                window.location.href = `/pages/command-center.html?roomCode=${roomCode}`;
            });
        }

        tableBody.appendChild(row);
    }
});