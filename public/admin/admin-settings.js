import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-functions.js";

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
const functions = getFunctions(app);

// Configure emulator if running locally
if (window.location.hostname === "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
}

document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("hamburger-menu");
    const menuDropdown = document.getElementById("menu-dropdown");
    const logoutButton = document.getElementById("logout-button");

    const locationInput = document.getElementById("location-input");
    const addLocationButton = document.getElementById("add-location");
    const locationsTableBody = document.querySelector("#locations-table tbody");

    const hostEmailInput = document.getElementById("host-email");
    const inviteHostButton = document.getElementById("invite-host");
    const hostsTableBody = document.querySelector("#hosts-table tbody");

    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log("User not authenticated. Redirecting to login page...");
            window.location.href = "/login.html"; // Redirect to login
        } else {
            console.log(`User authenticated: ${user.email}`);
            loadLocations(); // Load locations from the database
            loadHosts(); // Load invited hosts from the database
        }
    });

    // Toggle menu visibility
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        menuDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
        if (!menuDropdown.contains(event.target) && event.target !== menuButton) {
            menuDropdown.classList.add("hidden");
        }
    });

    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth.signOut()
            .then(() => {
                console.log("Logout successful. Redirecting to login page...");
                window.location.href = "/login.html";
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                alert("An error occurred while logging out. Please try again.");
            });
    });

    // Add location functionality
    addLocationButton.addEventListener("click", async () => {
        const locationName = locationInput.value.trim();
        if (!locationName) {
            alert("Please enter a location name.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "locations"), { name: locationName });
            addLocationToTable(locationName, docRef.id);
            locationInput.value = "";
        } catch (error) {
            console.error("Error adding location:", error);
            alert("An error occurred while adding the location.");
        }
    });

    async function loadLocations() {
        try {
            const querySnapshot = await getDocs(collection(db, "locations"));
            querySnapshot.forEach((doc) => {
                addLocationToTable(doc.data().name, doc.id);
            });
        } catch (error) {
            console.error("Error loading locations:", error);
            alert("An error occurred while loading locations.");
        }
    }

    function addLocationToTable(name, id) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${name}</td>
            <td><button class="btn-remove" data-id="${id}">-</button></td>
        `;
        locationsTableBody.appendChild(row);

        row.querySelector(".btn-remove").addEventListener("click", async (e) => {
            const locationId = e.target.dataset.id;
            try {
                await deleteDoc(doc(db, "locations", locationId));
                row.remove();
            } catch (error) {
                console.error("Error deleting location:", error);
                alert("An error occurred while deleting the location.");
            }
        });
    }

    // Invite host functionality
inviteHostButton.addEventListener("click", async () => {
    const email = hostEmailInput.value.trim();
    const messageContainer = document.getElementById("host-message");

    // Clear any previous message
    messageContainer.textContent = "";
    messageContainer.style.color = ""; // Reset color

    if (email === "") {
        messageContainer.textContent = "Please enter an email address.";
        messageContainer.style.color = "red"; // Error color
        return;
    }

    try {
        // Call the Firebase function to send an invite email
        const sendInvite = httpsCallable(functions, "inviteHost");
        const response = await sendInvite({ email });

        // Show success message
        messageContainer.textContent = response.data.message;
        messageContainer.style.color = "green"; // Success color

        // Add host invite to Firestore and the table
        await setDoc(doc(db, "hosts", email), { email, status: "Pending" });
        addHostToTable(email, "Pending");
        hostEmailInput.value = ""; // Clear input field
    } catch (error) {
        console.error("Error inviting host:", error);

        // Show error message
        messageContainer.textContent = "Failed to send invitation. Please try again.";
        messageContainer.style.color = "red"; // Error color
    }
});

    async function loadHosts() {
        try {
            const querySnapshot = await getDocs(collection(db, "hosts"));
            querySnapshot.forEach((doc) => {
                const { email, status } = doc.data();
                addHostToTable(email, status);
            });
        } catch (error) {
            console.error("Error loading hosts:", error);
            alert("An error occurred while loading hosts.");
        }
    }

    function addHostToTable(email, status) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${email}</td>
            <td>${status}</td>
            <td><button class="btn-remove" data-email="${email}">-</button></td>
        `;
        hostsTableBody.appendChild(row);

        row.querySelector(".btn-remove").addEventListener("click", async (e) => {
            const hostEmail = e.target.dataset.email;
            try {
                if (status === "Pending") {
                    await deleteDoc(doc(db, "hosts", hostEmail));
                } else if (status === "Accepted") {
                    alert("Host access revoked.");
                }
                row.remove();
            } catch (error) {
                console.error("Error revoking host:", error);
                alert("An error occurred while revoking the host.");
            }
        });
    }
});