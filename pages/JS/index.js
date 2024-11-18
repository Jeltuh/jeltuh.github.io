// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";



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




function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Check of de gebruiker ingelogd is


// Functie om punten op te slaan in Firestore
async function savePoints(userId, additionalPoints) {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);

        let currentPoints = 0;
        if (docSnap.exists()) {
            currentPoints = docSnap.data().points || 0; // Get current points or default to 0
        }

        const newPoints = currentPoints + additionalPoints; // Add the new points

        await setDoc(userRef, { points: newPoints }, { merge: true });
        console.log("Points successfully updated!");
    } catch (error) {
        console.error("Error saving points: ", error);
    }
}

// Functie om de punten op te halen
async function getPoints(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data().points;
        } else {
            return 0; // Default als er nog geen punten zijn
        }
    } catch (error) {
        console.error("Fout bij het ophalen van punten: ", error);
        return 0;
    }
}

// Wait until the user is authenticated
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, get the user's document
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                // Fetch the firstName field
                const firstName = userDoc.data().firstName;
                // Display firstName in HTML
                document.getElementById("displayFirstName").innerText = firstName || "User";
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
    }
});

// Functie om de punten weer te geven in een HTML-element
async function displayPoints(userId) {
    const points = await getPoints(userId);
    document.getElementById("pointsDisplay").innerText = points;
}


// Wait for the Firebase auth state to be initialized



const loginButton = document.getElementById("loginButton");
const accountDropdown = document.getElementById("accountDropdown");
const accountPoints = document.getElementById("accountPoints");
const logoutButton = document.getElementById("logoutButton");
const logoutButton2 = document.getElementById("logoutButton2");
const protectedContent = document.getElementById("protected-content");


// Display the correct button based on auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        loginButton.classList.add("d-none");
        accountDropdown.classList.remove("d-none");
        document.getElementById("index-message").innerText = "Klik hier om naar de opdrachten te gaan.";



        // Fetch and display the user's points
        const points = await getUserPoints(user.uid);
        accountPoints.innerText = points;

    } else {
        // User is not logged in
        loginButton.classList.remove("d-none");
        accountDropdown.classList.add("d-none");

    }
});

// Show modal using jQuery
//$('#accountModal').modal('show');

// Login button in the modal
document.getElementById("loginSubmitButton").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        $('#loginModal').modal('hide'); // Hide modal on successful login
    } catch (error) {
        console.error("Login error:", error);
        showToast("Login failed. Please check your credentials.");
    }
});


const dynamicButton = document.getElementById("inloggen");

// Ensure the button exists
if (!dynamicButton) {
    console.error("Button with id 'dynamic-button' not found.");
}

// Check Firebase Authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        dynamicButton.textContent = "Ga naar";
        dynamicButton.onclick = () => {
            window.location.href = "Pages/HTML/library.html";
        };
    } else {
        // User is not logged in
        dynamicButton.textContent = "Inloggen";
        dynamicButton.onclick = () => {
            const loginModal = $('#loginModal');
                const registerModal = $('#registerModal');

                if (loginModal.length && registerModal.length) {
                    loginModal.modal('show'); // Show the login modal

                    // Open Register Modal from Login Modal
                    $('#openRegisterModal').on('click', function() {
                        loginModal.modal('hide'); // Hide the login modal
                        registerModal.modal('show'); // Show the register modal
                    });
    }
}}});

// Logout button in the account dropdown
logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    window.location.reload(); // Reload to reflect changes in the UI
});

// Fetch user's points from Firestore
async function getUserPoints(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data().points || 0;
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error fetching user points:", error);
        return 0;
    }
}




// Bootstrap modal instances
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

// Open Register Modal from Login Modal
document.getElementById("openRegisterModal").addEventListener("click", () => {
    $('#loginModal').modal('hide')
    registerModal.show(); // Show the register modal
});

// Register button event listener
document.getElementById("registerSubmitButton").addEventListener("click", async () => {
    const firstName = document.getElementById("firstNameInput").value;
    const lastName = document.getElementById("lastNameInput").value;
    const email = document.getElementById("registerEmailInput").value;
    const password = document.getElementById("registerPasswordInput").value;

    try {
        // Register the user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user info (e.g., name) to Firestore
        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email,
            points: 0 // Initialize points to 0
        });

        // Automatically log the user in after registration
        registerModal.hide(); // Close the register modal

        console.log("Registration and login successful!");
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please check the details and try again.");
    }
});

// Event listeners for the close buttons to ensure proper hiding
document.querySelectorAll('.btn-close').forEach(button => {
    button.addEventListener("click", () => {
        loginModal.hide();
        registerModal.hide();
    });
});


// Open account modal
document.getElementById("openAccountModal").addEventListener("click", async () => {
    $('#accountModal').modal('show');
    const user = auth.currentUser;
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            document.getElementById("firstName").value = docSnap.data().firstName || "";
            document.getElementById("lastName").value = docSnap.data().lastName || "";
        }
    }
});

// Update first name and last name
document.getElementById("nameForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;

    if (user) {
        if (!firstName || !lastName) {
            alert("All fields must be filled.");
            return;
        }
        // Update Firestore data
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { firstName, lastName });
        alert("Name details updated successfully.");
    }
});

// Update password
document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (user) {
        // Password change validation and process
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            alert("To change the password, all password fields must be filled.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            alert("Password updated successfully.");
        } catch (error) {
            alert("Failed to reauthenticate. Please check your current password.");
            console.error("Reauthentication error:", error);
        }
    }
});

// Logout
document.getElementById("logoutButton").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        $('#accountModal').modal('hide');
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
});

// Logout button in the account dropdown
logoutButton2.addEventListener("click", async () => {
    await signOut(auth);
    window.location.reload(); // Reload to reflect changes in the UI
});

// Logout
document.getElementById("logoutButton2").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        $('#accountModal').modal('hide');
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
});


//toast
function showToast(content = "Unknown error") { //You can change the default value
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    //Change the text (not mandatory, but I think you might be willing to do it)
    x.innerHTML = content;

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

//Simulating a call to your API   







function checkAnswer() {
    const questionId = getQuestionIdFromUrl();
    const questionData = questions[questionId];
    const userAnswer = document.getElementById("answer").value.trim();

    if (questionData) {
        document.getElementById("question").textContent = questionData.question;
        document.getElementById("hint").textContent = questionData.hint;
        document.getElementById("hint").style.display = "none";
    } else {
        console.error("Vraag niet gevonden.");
    }

    if (questionData && userAnswer === questionData.answer) {
        alert("Correct! Ga door naar de volgende vraag.");
        window.location.href = `question.html?id=${parseInt(questionId) + 1}`;
    } else {
        attempts++;
        alert("Fout antwoord, probeer het opnieuw.");
        if (attempts >= 2) {
            document.getElementById("hint").style.display = "block";
        }
    }
}






function getQuestionIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id")) || 1; // Default to 1 if no ID is provided
}

function loadQuestionContent() {
    const questionId = getQuestionIdFromUrl();
    const questionContainer = document.getElementById("body-text");

    // Clear the container first
    questionContainer.innerHTML = "";

    if (questionId === 1) {
        questionContainer.innerHTML = `
                        <h3>Opdracht 1</h3>

        <p><i>Deze opdracht komt overeen met vraag 7 in je werkboek.</i></p>
        <p>Bij deze opdracht is te zien dat het verplaatsen van punt B op de eenheidscirkel
            er voor zorgt dat de hoek tot punt B ook veranderd.</p>
        <p>Kijk door het verschuiven van
            punt B op de eenheidscirkel wat dit betekent voor de hoek a.</p>
        <p>Tip: De cos(a) veranderd met de x-waarde van B, en de sin(a) veranderd met de y-waarde van B</p>


        <p><b> 7A.</b> Xb = 0,81</p>
        <p><b> 7B.</b> Yb = 0,94</p>
        <p><b> 7C.</b> Xb = 0,26</p>
        <p><b> 7D.</b> Yb = -0,22</p>

        <br>
        <p>Zie de bijlage voor de figuur.</p>


        <div class="buttons">
            <!-- Modal Bijlage -->
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-example-modal-lg">Zie de
                bijlage</button>

            <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <img src="../../assets/hf8-vraag7.png">
                    </div>
                </div>
            </div>

            
            <p>Controleer hier je antwoorden en bekijk de bijbehorende theorie.</p>


            <button type="button" class="btn btn-primary btn-lg" onclick="naar_theorie_8_1()">Theorie</button>


            <!-- Modal Uitwerkingen -->
            <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#exampleModalCenter">
                Uitwerkingen
            </button>

            <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog"
                aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLongTitle">Uitwerkingen</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <b>A:</b> <i>De X wordt gegeven. Gebruik daarom de Cosinus. Cos(a)=0,81 in de GR geeft
                                35,90...°. Afgerond is de hoek a dus ≈ <b>35,9°</b>.</i><br><br>
                            <b>B:</b> <i>De Y wordt gegeven. Gebruik daarom de Sinus. Sin(a)=0,94 in de GR geeft
                                70,05...°.
                                In het plaatje is te zien dat punt B voorbij de 90° komt.</i><br>
                            Dit betekend dat er eerst 180° - het antwoord moet worden gedaan. Op deze manier kom je uit
                            op a
                            ≈ 180° - 70,1° ≈ <b>109,9°</b>.
                        </div>
                        <div class="modal-footer">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <iframe scrolling="no" frameBorder="0" title="Eenheidscirkel"
            src="https://www.geogebra.org/material/iframe/id/c9dq6qrb/width/1000/height/569/border/ffffff/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false"
            width="80%" height="50%" style="position: absolute; right: -36%; top:20%"> </iframe>

        <div class="wrapper">
        <div class="push"></div>
    </div>

              `;
    } else if (questionId === 2) {
        questionContainer.innerHTML = `
                <h2>Vraag 2</h2>
                <p>Wat is de afgeleide van x^2?</p>
                <input type="text" id="answer">
                <button onclick="checkAnswer(2)">Controleer antwoord</button>
              `;
    } else {
        questionContainer.innerHTML = `
                <h2>Vraag ${questionId}</h2>
                <p>Deze vraag bestaat nog niet. Kies een andere vraag.</p>
              `;
    }
}

// Call the function when the page loads






// Example user and lesson IDs
const userId = "wmn89rkE03Yh2sAdV2sS4W6UwY02";  // Replace with your actual user ID
const lessonId = "lessonehc";  // Replace with your actual lesson ID

// Get the question number from the URL parameter `id`
const urlParams = new URLSearchParams(window.location.search);
const questionId = parseInt(urlParams.get("id")) || 1;  // Defaults to 1 if `id` is not present

// Get the reference to the lesson document
const lessonRef = doc(db, 'users', userId, 'lessons', lessonId);

// Function to initialize the current question on page load
async function initializeCurrentQuestion() {
    try {
        const docSnap = await getDoc(lessonRef);

        if (docSnap.exists()) {
            const currentQuestion = docSnap.data().current_question || 1;

            // Check if the URL `id` matches the current question; if not, redirect to the current question
            if (questionId !== currentQuestion) {
                window.location.href = `test2.html?id=${currentQuestion}`;
            }
        } else {
            console.error("No such document!");
        }
    } catch (error) {
        console.error("Error initializing question:", error);
    }
}

// Function to go to the next question


// Function to mark the lesson as completed
async function markLessonCompleted() {
    try {
        await updateDoc(lessonRef, { completed: true });
        console.log("Lesson marked as completed.");
        checkLessonCompletion();
    } catch (error) {
        console.error("Error marking lesson as completed:", error);
    }
}

// Function to check lesson completion and display the message
async function checkLessonCompletion() {
    try {
        const docSnap = await getDoc(lessonRef);

        if (docSnap.exists()) {
            const isCompleted = docSnap.data().completed;

            const completionMessage = document.getElementById('completionMessage');
            if (isCompleted) {
                completionMessage.style.visibility = 'hidden';  // Show the message
            } else {
                completionMessage.style.visibility = 'shown';  // Hide the message
            }
        }
    } catch (error) {
        console.error("Error checking lesson completion:", error);
    }
}



// Event listener for the "Next Question" button

// Event listener for the "Mark Completed" button

// Initialize the question display and check completion status on page load

function replaceButton() {
    // Get the original button by its id
    const oldButton = document.getElementById('next');

    // Create the new button element
    const newButton = document.createElement('button');

    // Set the properties for the new button
    newButton.type = 'button';
    newButton.id = "markCompletedButton"
    newButton.classList.add('btn', 'btn-success');
    newButton.innerText = 'Inleveren';



    // Replace the old button with the new one
    oldButton.parentNode.replaceChild(newButton, oldButton);

    newButton.addEventListener('click', markLessonCompleted);
}



function updateButtons() {
    const id = getQuestionIdFromUrl();

    const prevButton = document.getElementById('previous');
    const nextButton = document.getElementById('next');

    // Show/Hide previous button if on the first question
    if (id === 1) {
        prevButton.style.visibility = 'hidden'; // Hide previous button
    } else {
        prevButton.style.visibility = 'shown'; // Show previous button
        prevButton.onclick = async function () {
            const questionId = getQuestionIdFromUrl();
            const nextQuestion = questionId - 1;
            await updateDoc(lessonRef, { current_question: nextQuestion });
            window.location.href = `test2.html?id=${id - 1}`;
        };
    }

    // Show/Hide next button if on the last question
    if (id === 5) {
        replaceButton();
    } else {
        nextButton.style.visibility = 'shown'; // Show next button
        nextButton.onclick = async function () {
            const questionId = getQuestionIdFromUrl();
            const nextQuestion = questionId + 1;
            await updateDoc(lessonRef, { current_question: nextQuestion });
            window.location.href = `test2.html?id=${id + 1}`;
        };
    }
}

function laadOpdracht() {
    const questionId = getQuestionIdFromUrl();
    document.getElementById("question").innerText = "Opdracht " + questionId;
}



// Call the function when the page loads


window.onload = function () {

};
