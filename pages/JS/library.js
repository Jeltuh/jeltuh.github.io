import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyC0lml6tn9XBBwMXv2ihniRR6G8w89eAp8",
authDomain: "pws-onderzoek-48e1c.firebaseapp.com",
projectId: "pws-onderzoek-48e1c",
storageBucket: "pws-onderzoek-48e1c.appspot.com",
messagingSenderId: "509841664982",
appId: "1:509841664982:web:b8e77c8fc701ab73895277"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

    // Get lessonId from URL parameters
    async function updateAllLessonCards() {
        const auth = getAuth();
        const db = getFirestore();
    
        // Wait for the user to be authenticated
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid; // Firebase user ID
                console.log("User ID:", userId);
    
                // Select all lesson cards
                const lessonCards = document.querySelectorAll(".lesson");
    
                if (lessonCards.length === 0) {
                    console.error("No lesson cards found in the DOM.");
                    return;
                }
    
                // Iterate over each lesson card
                for (const lessonCard of lessonCards) {
                    const lessonId = lessonCard.id; // Use card's `id` attribute as lesson ID
    
                    if (!lessonId) {
                        console.error("Lesson card ID is not defined for a card.");
                        continue;
                    }
    
                    try {
                        console.log(`Fetching data for lesson ID: ${lessonId}`);
                        const lessonRef = doc(db, "users", userId, "lessons", lessonId);
                        const lessonSnap = await getDoc(lessonRef);
    
                        // Get the button and ensure it exists in the card
                        const button = lessonCard.querySelector("#lesson-button");
                        if (!button) {
                            console.error("No button found inside the lesson card:", lessonCard);
                            continue;
                        }
    
                        if (lessonSnap.exists()) {
                            const data = lessonSnap.data();
                            const { current_question, completed } = data;
    
                            if (completed) {
                                // Mark lesson as completed
                                button.textContent = "Ga naar de resultaten";
                                button.onclick = () => {
                                    window.location.href = `resultaten.html?id=${lessonId}`;
                                };
    
                                // Add "COMPLETED" text to the card if it doesn't already exist
                                if (!lessonCard.querySelector(".completed-text")) {
                                    const completedText = document.createElement("span");
                                    completedText.textContent = "VOLTOOID";
                                    completedText.classList.add("completed-text"); // Add a class for styling
                                    completedText.style.color = "green";
                                    completedText.style.fontWeight = "bold";
                                    completedText.style.position = "absolute";
                                    completedText.style.top = "10px";
                                    completedText.style.right = "10px";
                                    lessonCard.style.position = "relative"; // Ensure card has relative positioning for absolute placement
                                    lessonCard.appendChild(completedText);
                                }
                            } else if (current_question > 1) {
                                // Resume the lesson
                                button.textContent = "Hervat";
                                button.onclick = () => {
                                    window.location.href = `${lessonId}.html?id=${current_question}`;
                                };
                            } else {
                                // Start the lesson
                                button.textContent = "START";
                                button.onclick = () => {
                                    window.location.href = `${lessonId}.html?id=1`;
                                };
                            }
                        } else {
                            // Handle case where lesson data doesn't exist
                            console.error("Lesson data not found for user:", userId, "and lessonId:", lessonId);
                            button.textContent = "START";
                            button.onclick = () => {
                                window.location.href = `${lessonId}.html?id=1`;
                            };
                        }
                    } catch (error) {
                        console.error("Error fetching lesson progress for lessonId:", lessonId, error);
                    }
                }
            } else {
                console.error("User is not authenticated.");
            }
        });
    }
    
    // Call the function on page load
    document.addEventListener("DOMContentLoaded", updateAllLessonCards);


