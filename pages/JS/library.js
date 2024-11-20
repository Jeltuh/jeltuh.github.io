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

async function loadLessonProgressAutomatically() {
    const auth = getAuth();
    const db = getFirestore();

    // Get lessonId from URL parameters

    const lessonCard = document.querySelector(".lesson");
    if (!lessonCard) {
        console.error("Lesson card element not found in the DOM.");
        return;
    }

    // Use the card's `id` attribute as the `lessonId`
    const lessonId = lessonCard.id;
    if (!lessonId) {
        console.error("Lesson card ID is not defined.");
        return;
    }

 

    // Wait for the user to be authenticated
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userId = user.uid; // Firebase user ID
            console.log("User ID:", userId);
            console.log("Lesson ID:", lessonId);

            try {
                const lessonRef = doc(db, 'users', userId, 'lessons', lessonId);
                const lessonSnap = await getDoc(lessonRef);

                const card = document.querySelector(".lesson");

                if (lessonSnap.exists()) {
                    const data = lessonSnap.data();
                    const { current_question, completed } = data;

                    const button = document.getElementById("lesson-button");

                    if (completed) {
                        button.textContent = "Ga naar de resultaten";
                        button.onclick = () => {
                            window.location.href = `resultaten.html?id=${lessonId}`;
                        };
                        // Add "COMPLETED" text to the card
                        const completedText = document.createElement("span");
                        completedText.textContent = "VOLTOOID";
                        completedText.style.color = "green";
                        completedText.style.fontWeight = "bold";
                        completedText.style.position = "absolute";
                        completedText.style.top = "10px";
                        completedText.style.right = "10px";
                        lessonCard.style.position = "relative"; // Ensure card has relative positioning for absolute placement
                        lessonCard.appendChild(completedText);
                    } else if (current_question > 1) {
                        button.textContent = "Hervat";
                        button.onclick = () => {
                            window.location.href = `lessonehc.html?id=${current_question}`;
                        };
                    } else {
                        button.textContent = "START";
                        button.onclick = () => {
                            window.location.href = "lessonehc.html?id=1";
                        };
                    }
                } else {
                    const button = document.getElementById("lesson-button");
                    console.error("Lesson data not found for user:", userId, "and lessonId:", lessonId);
                    button.textContent = "START";
                    button.onclick = () => {
                    window.location.href = "lessonehc.html?id=1";}
                }
            } catch (error) {
                console.error("Error fetching lesson progress:", error);
            }
        } else {
            console.error("User is not authenticated.");
        }
    });
}

// Call the function
loadLessonProgressAutomatically();
