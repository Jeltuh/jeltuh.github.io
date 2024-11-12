import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Example user and lesson IDs
const userId = "wmn89rkE03Yh2sAdV2sS4W6UwY02";  // replace with your actual user ID
const lessonId = "lessonehc";  // replace with your actual lesson ID

// Get the reference to the lesson document using modular SDK
const lessonRef = doc(db, 'users', userId, 'lessons', lessonId);

// Function to increment the current question in Firestore
async function goToNextQuestion() {
    try {
        // Get the current value of `current_question`
        const docSnap = await getDoc(lessonRef);
        
        if (docSnap.exists()) {
            let currentQuestion = docSnap.data().current_question || 1;

            // Increment `current_question` by 1
            currentQuestion += 1;

            // Update `current_question` in Firestore
            await updateDoc(lessonRef, { current_question: currentQuestion });
            console.log("Question updated to:", currentQuestion);

            // Update the displayed current question
            document.getElementById('currentQuestionDisplay').innerText = currentQuestion;
        } else {
            console.error("No such document!");
        }
    } catch (error) {
        console.error("Error updating question:", error);
    }
}


// Function to mark the lesson as completed
async function markLessonCompleted() {
    try {
        // Update the 'completed' field to true
        await updateDoc(lessonRef, { completed: true });
        console.log("Lesson marked as completed.");

        // Update the displayed status
        document.getElementById('lessonStatusDisplay').innerText = "Completed";
        checkLessonCompletion();
    } catch (error) {
        console.error("Error marking lesson as completed:", error);
    }
}

async function checkLessonCompletion() {
    try {
        // Get the current value of `completed`
        const docSnap = await getDoc(lessonRef);
        
        if (docSnap.exists()) {
            const isCompleted = docSnap.data().completed;

            // Conditionally show the completion message based on 'completed' field
            const completionMessage = document.getElementById('completionMessage');
            if (isCompleted) {
                completionMessage.style.display = 'block';  // Show the message
            } else {
                completionMessage.style.display = 'none';  // Hide the message
            }
        }
    } catch (error) {
        console.error("Error checking lesson completion:", error);
    }
}

// Function to initialize the current question on page load
async function initializeCurrentQuestion() {
    try {
        // Get the current value of `current_question`
        const docSnap = await getDoc(lessonRef);

        if (docSnap.exists()) {
            const currentQuestion = docSnap.data().current_question || 1;

            // Set the current question in the displayed UI
            document.getElementById('currentQuestionDisplay').innerText = `Current Question: ${currentQuestion}`;
        } else {
            console.error("No such document!");
        }
    } catch (error) {
        console.error("Error initializing question:", error);
    }
}

// Add event listener to the "Next Question" button
document.getElementById('nextQuestionButton').addEventListener('click', goToNextQuestion);

// Add event listener to the "Mark Completed" button
document.getElementById('markCompletedButton').addEventListener('click', markLessonCompleted);

window.onload = function() {
    checkLessonCompletion();
    initializeCurrentQuestion();
};
