import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(); // Initialize Firebase Auth

document.addEventListener("DOMContentLoaded", async () => {
    // Extract roomCode from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get("roomCode");

    const wagerBtn = document.querySelector(".wager-btn");

    wagerBtn.addEventListener("click", () => {
        wagerBtn.classList.toggle("active");
        wagerBtn.textContent = wagerBtn.classList.contains("active") ? "Close Wagering" : "Open Wagering";
    });

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            alert("User not authenticated. Redirecting to login...");
            window.location.href = "/login.html";
        } else {
            console.log("User authenticated:", user.email);
        }
    });

    if (!roomCode) {
        alert("Invalid room code. Redirecting...");
        window.location.href = "/admin/dashboard.html"; // Redirect back to dashboard
        return;
    }

    try {
        // Fetch game data from Firestore using roomCode
        const gamesRef = collection(db, "games");
        const gameQuery = query(gamesRef, where("roomCode", "==", roomCode));
        const gameSnapshot = await getDocs(gameQuery);

        if (gameSnapshot.empty) {
            alert("Game not found. Redirecting...");
            window.location.href = "/admin/dashboard.html"; // Redirect back to dashboard
            return;
        }

        // Assume only one game matches the roomCode
        const gameData = gameSnapshot.docs[0].data();
        console.log("Fetched Game Data:", gameData);

        // Populate the Command Center UI
        populateCommandCenter(gameData);
    } catch (error) {
        console.error("Error fetching game data:", error);
        alert("An error occurred while loading the game. Redirecting...");
        window.location.href = "/admin/dashboard.html"; // Redirect back to dashboard
    }
});

document.getElementById('show-leaderboard-btn').addEventListener('click', () => {
    const button = document.getElementById('show-leaderboard-btn');

    // Toggle the "active" class
    button.classList.toggle('active');

    // Update button text
    if (button.classList.contains('active')) {
        button.textContent = 'Hide Leaderboard'; // When active (green)
    } else {
        button.textContent = 'Show Leaderboard'; // When inactive (grey)
    }
});

function populateCommandCenter(gameData) {
    // Ensure rounds data exists
    if (!gameData.rounds) {
        console.error("Rounds data is missing in the game data.");
        alert("Game data is incomplete. Redirecting...");
        window.location.href = "/admin/dashboard.html";
        return;
    }

    // Populate questions for Round 1
    const round1Section = document.querySelector(".round-section:nth-child(1) .questions");
    const round1 = gameData.rounds.round1; // Access round1

    if (!round1) {
        console.error("Round 1 data is missing in the game data.");
        alert("Game data is incomplete. Redirecting...");
        window.location.href = "/admin/dashboard.html";
        return;
    }

    // Sort keys (q1, q2, etc.) numerically and extract values
    const round1Questions = Object.keys(round1)
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))) // Sort by numeric part of key
        .map((key) => round1[key]);

    round1Section.innerHTML = round1Questions
        .map((question, index) => `
            <div class="question-row">
                <span class="question-text">Question ${index + 1}: ${question}</span>
                <div class="question-buttons">
                    <button class="activate-btn">Activate</button>
                </div>
            </div>
        `)
        .join("");

    // Populate questions for Round 2
    const round2Section = document.querySelector(".round-section:nth-child(2) .questions");
    const round2 = gameData.rounds.round2; // Access round2

    if (!round2) {
        console.error("Round 2 data is missing in the game data.");
        alert("Game data is incomplete. Redirecting...");
        window.location.href = "/admin/dashboard.html";
        return;
    }

    // Extract and sort keys for artists (e.g., a7, a8, ...) and titles (e.g., t7, t8, ...)
    const artistKeys = Object.keys(round2)
        .filter((key) => key.startsWith("a"))
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    const titleKeys = Object.keys(round2)
        .filter((key) => key.startsWith("t"))
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    // Map sorted keys to their respective data
    const round2Questions = artistKeys.map((artistKey, index) => {
        const titleKey = titleKeys[index]; // Match title key with artist key
        return {
            artist: round2[artistKey],
            title: titleKey ? round2[titleKey] : null, // Handle cases where title might be missing
        };
    });

    // Render Round 2 questions
    round2Section.innerHTML = round2Questions
        .map((question, index) => `
            <div class="question-row">
                <span class="question-text">Question ${index + 6}: 
                    ${question.artist} ${question.title ? " / " + question.title : ""}
                </span>
                <div class="question-buttons">
                    <button class="activate-btn">Activate</button>
                </div>
            </div>
        `)
        .join("");
    
    // Populate Round 3
    const round3Section = document.querySelector(".round-section:nth-child(3) .questions");
    const round3 = gameData.rounds.round3;

    if (round3) {
        const artistKeys = Object.keys(round3)
            .filter((key) => key.startsWith("a"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
        const titleKeys = Object.keys(round3)
            .filter((key) => key.startsWith("t"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

        const round3Questions = artistKeys.map((artistKey, index) => {
            const titleKey = titleKeys[index];
            return {
                artist: round3[artistKey],
                title: titleKey ? round3[titleKey] : null,
            };
        });

        round3Section.innerHTML = round3Questions
            .map((question, index) => `
                <div class="question-row">
                    <span class="question-text">Question ${index + 11}: 
                        ${question.artist} ${question.title ? " / " + question.title : ""}
                    </span>
                    <div class="question-buttons">
                        <button class="activate-btn">Activate</button>
                    </div>
                </div>
            `)
            .join("");
    } else {
        console.error("Round 3 data is missing.");
    }

    // Populate Round 4
    const round4Section = document.querySelector(".round-section:nth-child(4) .questions");
    const round4 = gameData.rounds.round4;

    if (round4) {
        const artistKeys = Object.keys(round4)
            .filter((key) => key.startsWith("a"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
        const titleKeys = Object.keys(round4)
            .filter((key) => key.startsWith("t"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

        const round4Questions = artistKeys.map((artistKey, index) => {
            const titleKey = titleKeys[index];
            return {
                artist: round4[artistKey],
                title: titleKey ? round4[titleKey] : null,
            };
        });

        round4Section.innerHTML = round4Questions
            .map((question, index) => `
                <div class="question-row">
                    <span class="question-text">Question ${index + 16}: 
                        ${question.artist} ${question.title ? " / " + question.title : ""}
                    </span>
                    <div class="question-buttons">
                        <button class="activate-btn">Activate</button>
                    </div>
                </div>
            `)
            .join("");
    } else {
        console.error("Round 4 data is missing.");
    }

    // Populate Round 5
    const round5Section = document.querySelector(".round-section:nth-child(5) .questions");
    const round5 = gameData.rounds.round5;

    if (round5) {
        const artistKeys = Object.keys(round5)
            .filter((key) => key.startsWith("a"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
        const titleKeys = Object.keys(round5)
            .filter((key) => key.startsWith("t"))
            .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

        const round5Questions = artistKeys.map((artistKey, index) => {
            const titleKey = titleKeys[index];
            return {
                artist: round5[artistKey],
                title: titleKey ? round5[titleKey] : null,
            };
        });

        round5Section.innerHTML = round5Questions
            .map((question, index) => `
                <div class="question-row">
                    <span class="question-text">Question ${index + 21}: 
                        ${question.artist} ${question.title ? " / " + question.title : ""}
                    </span>
                    <div class="question-buttons">
                        <button class="activate-btn">Activate</button>
                    </div>
                </div>
            `)
            .join("");
    } else {
        console.error("Round 5 data is missing.");
    }

    // Populate Final Question
    const finalQuestionsContainer = document.querySelector(".round-section:nth-child(6) .questions");
    const finalQuestionsData = gameData.finalQuestion;

    if (!finalQuestionsData) {
        console.error("Final questions data is missing.");
        return;
    }

    console.log("Final Questions Data:", finalQuestionsData);
    // Populate final questions dynamically
    const finalQuestions = Object.keys(finalQuestionsData)
        .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))) // Sort by numeric part of the keys
        .map((key) => finalQuestionsData[key]);

    finalQuestionsContainer.innerHTML = finalQuestions
        .map((question, index) => `
            <div class="question-row">
                <span class="question-text">Question ${index + 1}: "${question.lyric}" (${question.wordCount})</span>
                <div class="question-buttons">
                    <button class="activate-btn">Activate</button>
                </div>
            </div>
        `)
        .join("");
    
}