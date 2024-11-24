
import "../JS/initialize.js";
import { getFirestore, doc, getDocs, collection, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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
        
function backToLibrary(){
    window.location.href = "library.html";
}


function getQuestionIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id")) || 1; // Default to 1 if no ID is provided
}

function getLessonId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || 1; // Default to 1 if no ID is provided
}

    // Function to get the lesson reference
    export async function getLessonRef() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const userId = user.uid;
                    const lessonId = getLessonId();
                    console.log(userId + lessonId)
                    const lessonRef = doc(getFirestore(), 'users', userId, 'lessons', lessonId);

                    resolve(lessonRef);
                } else {
                    console.error("User is not signed in.");
                    reject(new Error("User not signed in"));
                }
            });
        });
    }

 // Function to check if the lesson is completed
async function checkLessonCompleted() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(getAuth(), async (user) => {
            if (user) {
                const userId = user.uid;

                // Retrieve the current lesson ID from the URL
                const fullPath = window.location.pathname; // e.g., "/lesson/page.html"
                const lessonId = getLessonId();

                // Reference to the lesson document
                const lessonDocRef = doc(getFirestore(), 'users', userId, 'lessons', lessonId);

                try {
                    const lessonDoc = await getDoc(lessonDocRef);

                    if (lessonDoc.exists()) {
                        const lessonData = lessonDoc.data();

                        // Check the `completed` field
                        const isCompleted = lessonData.completed || false; // Default to `false` if not set
                        console.log(`Lesson ${lessonId} completed status: ${isCompleted}`);

                        resolve(isCompleted);
                    } else {
                        console.error(`Lesson document ${lessonId} does not exist.`);
                        resolve(false);
                    }
                } catch (error) {
                    console.error("Error fetching lesson document:", error);
                    reject(error);
                }
            } else {
                backToLibrary();
                console.error("User is not signed in.");
                reject(new Error("User not signed in"));
            }
        });
    });
}

    
// Fetch all questions under a lesson and calculate the results
async function displayResults() {
    const lessonCompleted = await checkLessonCompleted();
    if (lessonCompleted) {
        try {
            // Get the current user
            const user = auth.currentUser;
            if (!user) {
                console.error("User is not authenticated.");
                return;
            }
            const userId = user.uid;

            // Define the lessonId (replace with dynamic retrieval if necessary)
            const lessonId = getLessonId()  ; // Replace with the actual lessonId variable

            // References to both "users" and "questions" collections
            const userLessonRef = collection(db, "users", userId, "lessons", lessonId, "questions");
            const questionsCollectionRef = collection(db, "questions", lessonId, "nummers");
            console.log("hoppa" + lessonId);

            // Fetch user attempts data
            const userAttemptsSnapshot = await getDocs(userLessonRef);
            const userAttemptsData = {};
            userAttemptsSnapshot.forEach((doc) => {
                userAttemptsData[doc.id] = doc.data().attempts || 0; // Map question ID to attempts
            });

            // Fetch question names from "questions" database
            const questionsSnapshot = await getDocs(questionsCollectionRef);

            let totalQuestions = 0; // Correctly declared
            let totalAttempts = 0;
            let summaryHtml = "";

            // Loop through each question document in "questions" database
            questionsSnapshot.forEach((doc) => {
                const questionId = doc.id;
                const questionData = doc.data();
                const questionName = questionData.vraag || `Question ${questionId}`; // Fetch `vraag` field
                const attempts = userAttemptsData[questionId] || 0; // Get attempts from user data

                totalQuestions++; // Increment total questions
                totalAttempts += attempts; // Accumulate total attempts

                // Add question details to the summary table
                summaryHtml += `
                    <tr>
                        <td>${doc.id}. ${questionName}</td>
                        <td>${attempts}</td>
                    </tr>
                `;
            });

            // ** Fix for the Score Calculation **
            // Ensure totalAttempts isn't zero to avoid division errors
            const score = totalQuestions > 0 ? ((totalQuestions / totalAttempts) * 100).toFixed(2) : 0;

            // Update HTML
            document.getElementById("total-questions").textContent = totalQuestions;
            document.getElementById("total-attempts").textContent = totalAttempts;
            document.getElementById("score").textContent = `${score}%`;
            document.getElementById("question-summary").innerHTML = summaryHtml;

        } catch (error) {
            console.error("Error fetching lesson data:", error);
        }
    } else {
        console.error("Lesson is not completed. Results cannot be displayed.");
    }
}


// Function to reset lesson data
async function resetLessonStatistics() {
    try {
        // Wait for the authenticated user
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const db = getFirestore();
                const userId = user.uid;

                // Get lesson ID from the current URL or define it explicitly
                const lessonId = getLessonId();

                // Reference to the lesson document
                const lessonRef = doc(db, "users", userId, "lessons", lessonId);

                // Reset lesson-level fields
                await updateDoc(lessonRef, {
                    completed: false,
                    current_question: 0,
                    latestQuestion: 0,
                });

                console.log("Lesson-level statistics reset successfully!");

                // Reset question-level statistics
                const questionsRef = collection(db, "users", userId, "lessons", lessonId, "questions");
                const questionsSnapshot = await getDocs(questionsRef);

                const resetPromises = [];
                questionsSnapshot.forEach((questionDoc) => {
                    const questionRef = doc(db, "users", userId, "lessons", lessonId, "questions", questionDoc.id);
                    resetPromises.push(updateDoc(questionRef, { attempts: 0 }));
                });

                // Wait for all question resets to complete
                await Promise.all(resetPromises);
                console.log("All question statistics reset successfully!");

                // Redirect to the library page
                window.location.href = "library.html";
            } else {
                console.error("User is not signed in.");
            }
        });
    } catch (error) {
        console.error("Error resetting lesson statistics:", error);
    }
}

// Attach the function to a button click
document.getElementById("reset-button").addEventListener("click", resetLessonStatistics);
document.getElementById("library").addEventListener("click", backToLibrary);


        // Call displayResults after DOM has loaded
window.onload = displayResults();