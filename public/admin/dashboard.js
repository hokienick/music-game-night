import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("hamburger-menu");
    const menuDropdown = document.getElementById("menu-dropdown");
    const logoutButton = document.getElementById("logout-button");
    const toggleCompleted = document.getElementById("toggle-completed");
    const tableRows = document.querySelectorAll(".games-table tbody tr");

    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log("User not authenticated. Redirecting to login page...");
            window.location.href = "/login.html"; // Redirect to login
        } else {
            console.log(`User authenticated: ${user.email}`);
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

        tableRows.forEach((row) => {
            const completedCheckbox = row.querySelector(".completed-checkbox");

            if (completedCheckbox.checked) {
                row.style.display = hideCompleted ? "none" : "";
            }
        });
    });

    // Add an event listener to each "Completed" checkbox
    tableRows.forEach((row) => {
        const completedCheckbox = row.querySelector(".completed-checkbox");

        completedCheckbox.addEventListener("change", () => {
            if (toggleCompleted.checked && completedCheckbox.checked) {
                // If "Show/Hide Completed" is checked and the row's checkbox is marked as completed, hide the row
                row.style.display = "none";
            } else {
                // Otherwise, ensure the row is displayed
                row.style.display = "";
            }
        });
    });
});