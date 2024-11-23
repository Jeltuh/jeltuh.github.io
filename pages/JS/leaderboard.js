import "../JS/initialize.js";
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0lml6tn9XBBwMXv2ihniRR6G8w89eAp8",
    authDomain: "pws-onderzoek-48e1c.firebaseapp.com",
    projectId: "pws-onderzoek-48e1c",
    storageBucket: "pws-onderzoek-48e1c.appspot.com",
    messagingSenderId: "509841664982",
    appId: "1:509841664982:web:b8e77c8fc701ab73895277"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fetchLeaderboard() {
    const leaderboardTableBody = document.querySelector("#leaderboard tbody");

    try {
        // Query users collection and order by points in descending order
        const usersCollection = collection(db, "users");
        const leaderboardQuery = query(usersCollection, orderBy("points", "desc"));
        const querySnapshot = await getDocs(leaderboardQuery);

        let rank = 1; // Track the rank of each user

        // Loop through each user and add to the table
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const username = userData.firstName || "Anonymous";
            const points = userData.points || 0;

            const row = document.createElement("tr");

            // Determine the row style (gold, silver, bronze)
            let rowStyle = ""; // Default style for other ranks
            if (rank === 1) {
                rowStyle = "background-color: gold; color: black; font-weight: bold;";
            } else if (rank === 2) {
                rowStyle = "background-color: silver; color: black; font-weight: bold;";
            } else if (rank === 3) {
                rowStyle = "background-color: #cd7f32; color: black; font-weight: bold;"; // Bronze
            }

            row.setAttribute("style", rowStyle); // Apply the style to the entire row

            row.innerHTML = `
                <td>${rank}</td>
                <td>${username}</td>
                <td>${points}</td>
            `;
            leaderboardTableBody.appendChild(row);

            rank++;
        });
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Load the leaderboard on page load
window.onload = fetchLeaderboard;
