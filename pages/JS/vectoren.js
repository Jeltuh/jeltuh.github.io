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
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        console.log("Gebruiker ingelogd:", userId);

        // Voorbeeld om punten op te slaan en weer te geven
        //savePoints(userId, 10);  // Voeg 10 punten toe
        // displayPoints(userId);   // Haal en toon de punten

        // Voorbeeld voor een knop
        const addPointsButton = document.getElementById("addPointsButton");
        addPointsButton.addEventListener("click", async () => {
            await savePoints(userId, 10); // Adds 10 points
            window.location.href = "library.html"; // Redirects to the homepage
        });

    } else {
        console.log("Geen gebruiker ingelogd.");
        window.location.href = "../../index.html";
    }
});


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

// Display the correct button based on auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        loginButton.classList.add("d-none");
        accountDropdown.classList.remove("d-none");
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

// Event listener
document.getElementById("registerSubmitButton").addEventListener("click", async () => {
    const firstName = document.getElementById("firstNameInput").value;
    const lastName = document.getElementById("lastNameInput").value;
    const email = document.getElementById("registerEmailInput").value;
    const password = document.getElementById("registerPasswordInput").value;

    try {
        // Register the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email,
            points: 0 
        });

        // Initialize the lessons
        const lessonsRef = doc(db, "users", user.uid, "lessons", "lessonehc");
        await setDoc(lessonsRef, {
            completed: false,
            current_question: 1,
            latestQuestion: 1 
        });

        const lessonsRef2 = doc(db, "users", user.uid, "lessons", "raaklijn");
        await setDoc(lessonsRef2, {
            completed: false,
            current_question: 1,
            latestQuestion: 1 
        });

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

const questionId = getQuestionIdFromUrl();
var Answer = 0;

function correctAnswer() {
    if (questionId === 1) {
        Answer = "Q(7(1)/(3),5(1)/(3)) en R(6(1)/(3),6(2)/(3))";
    }
    if (questionId === 3) {
        Answer = "N(9(1)/(2),8(1)/(2))";
    }
    else if (questionId === 2) {
        Answer = "1";
    }
    else if (questionId === 4) {
        Answer = "N(5(1)/(2),5(1)/(2))";
    }
    else {
    }
    console.log(questionId)
    return Answer;
}

    // Get the full path of the current URL
    const fullPath = window.location.pathname; // e.g., "/folder/page.html"

    // Extract the filename without the extension
    const lessonId = fullPath.substring(fullPath.lastIndexOf("/") + 1, fullPath.lastIndexOf("."));


function getQuestionIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id")) || 1; // Default to 1 if no ID is provided
}

export async function getQuestionRef() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;
                const questionId = String(getQuestionIdFromUrl());
                const fullPath = window.location.pathname; // e.g., "/folder/page.html"
                const lessonId = fullPath.substring(fullPath.lastIndexOf("/") + 1, fullPath.lastIndexOf("."));
                const questionRef = doc(getFirestore(), 'users', userId, 'lessons', lessonId, 'questions', questionId);
                resolve(questionRef);
            } else {
                console.error("User is not signed in.");
                reject(new Error("User not signed in"));
            }
        });
    });
}



async function incrementAttempts() {
    try {
        // Reference to the specific question
        const questionRef = await getQuestionRef();

        // Get the current question data
        const questionSnap = await getDoc(questionRef);

        // If the question exists, increment the attempts
        const currentAttempts = questionSnap.data().attempts || 0;
        await updateDoc(questionRef, {
            attempts: currentAttempts + 1
        });
        console.log(`Attempts updated to: ${currentAttempts + 1}`);

    } catch (error) {
        console.error("Error updating attempts:", error);
    }
}




function loadQuestionContent() {
    const questionId = getQuestionIdFromUrl();
    const questionContainer = document.getElementById("body-text");

    // Clear the container first
    questionContainer.innerHTML = "";

    if (questionId === 1) {
        questionContainer.innerHTML = `
        <div class="question">
            <h3>Opdracht 1</h3>
            <br>
            <p><i>Deze opdracht komt overeen met vraag 10.17 in je werkboek.</i></p>
            <br>
            <p style="margin-bottom:0;">Gegeven is het vierkant ABCD met A(3, 0) en D(0, 4). Op zijde BC liggen de punten P en S waarbij BP = PS = SC.</p>
            <p style="margin : 0; padding-top:0;">PS is een zijde van het vierkant PQRS.<p/>
            <p style="margin : 0; padding-top:0;">Zie de figuur.</p>
            <p><b>Bereken de coördinaten van de punten Q en R.</b></p>
            <br>

            <div class="buttons">
                <p>Open hier de bijbehorende theorie.</p>
                <div class="knoppen">
                <button type="button" class="btn btn-primary btn-lg" onclick="open_theorie_newwindow(10.1)">Theorie</button>
                <button type="button" id="uitwerkingen" class="btn btn-primary btn-lg" data-toggle="modal" data-target=".bd-example-modal-lg" style="visibility:hidden;">Uitwerkingen</button>
                
            <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <img src="../../assets/vectoren/vector-1-uitwerkingen.png">
                    </div>
                </div>
            </div>
            </div

                <br><p id="hoop" style="visibility:hidden;">Lukt het niet? Je kan vanaf nu ook door naar de volgende vraag.</p>

                <div class="question">
                    <input id="antwoord" type="text" class="search-input" placeholder="Type hier je antwoord...">
                    <button type="button" id="submit-btn">Submit</button>
                    <p><i>Tip: De manier van notatie is als volgt: Q(1(2)/(3),5(4)/(5)) en R(...)</i></p>
                    <p><img src="../../assets/notatie-voorbeeld.png"></p>
                    <p id="feedback" class="hidden"></p>
                </div>
                
            </div>
        </div>

        <iframe scrolling="no" frameBorder="0" title="Eenheidscirkel"
            src="https://www.geogebra.org/material/iframe/id/rsrrhnde/width/1000/height/569/border/ffffff/sfsb/false/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false"
            width="80%" height="50%" style="position: absolute; right: -28%; top:20%"> </iframe>

        <div class="wrapper">
        <div class="push"></div>
        </div>

              `;
    } else if (questionId === 2) {
        questionContainer.innerHTML = `
         <div class="question">
            <h3>Opdracht 2</h3>
            <br>
            <h2>Hoe ziet deze vector eruit als je hem rechtsom draait?</h2>
            <img src="../../assets/vector1.png" width="100" height="50">


            <div class="buttons">

                <div class="question">
                    <form id="quiz-form">
                    <div class="answer">
                        <label for="1"><img src="../../assets/vectoren/vector-2-1.png" width="90" height="35"></label>
                        <input type="radio" id="1" name="answer" value="1">
                    </div>
                    <div class="answer">
                        <label for="2"><img src="../../assets/vectoren/vector-2-2.png" width="90" height="35"></label>
                        <input type="radio" id="2" name="answer" value="2">
                    </div>
                    <div class="answer">
                        <label for="3"><img src="../../assets/vectoren/vector-2-3.png" width="90" height="35"></label>
                        <input type="radio" id="3" name="answer" value="3">
                    </div>
                    <div class="answer">
                        <label for="4"><img src="../../assets/vectoren/vector-2-4.png" width="90" height="35"></label>
                        <input type="radio" id="4" name="answer" value="4">
                    </div>
                    <button type="button" id="submit-btn">Submit</button>
                </form>
                    <p id="feedback" class="hidden"></p>
                </div>
                <p id="hoop" style="visibility:hidden;">Lukt het niet? Je kan vanaf nu ook door naar de volgende vraag.</p>
                <p>Open hier de bijbehorende theorie.</p>
                <div class="knoppen">
                <button type="button" class="btn btn-primary btn-lg" onclick="open_theorie_newwindow(10.1)">Theorie</button>
                <button type="button" id="uitwerkingen" class="btn btn-primary btn-lg" data-toggle="modal" data-target=".bd-example-modal-lg" style="visibility:hidden;">Uitwerkingen</button>
                
            <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <img src="../../assets/vectoren/vector-2-uitwerkingen.png">
                    </div>
                </div>
            </div>
            </div
                
            </div>
        </div>
        
        <div class="wrapper">
        <div class="push"></div>
        </div> 
              `;
    }
    else if (questionId === 3) {
        questionContainer.innerHTML = `
        <div class="question">
            <h3>Opdracht 3</h3>
            <br>
            <p><i>Deze opdracht komt overeen met vraag 10.15 in je werkboek.</i></p>
            <br>
            <p>Gegeven is het vierkant ABCD met A(5, 2) en D(2, 6).</p>
            <p>Verder is het punt M het midden van diagonaal AC. Ook is het vierkant MBNC getekend.<p/>
            <p><b>Bereken de coördinaten van punt N.</b></p>
            <br>

            <div class="buttons">
                <p>Open hier de bijbehorende theorie.</p>
                <div class="knoppen">
                <button type="button" class="btn btn-primary btn-lg" onclick="open_theorie_newwindow(10.1)">Theorie</button>
                <button type="button" id="uitwerkingen" class="btn btn-primary btn-lg" data-toggle="modal" data-target=".bd-example-modal-lg" style="visibility:hidden;">Uitwerkingen</button>
                
            <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <img src="../../assets/vectoren/vector-3-uitwerkingen.png">
                    </div>
                </div>
            </div>
            </div>

                <br><p id="hoop" style="visibility:hidden;">Lukt het niet? Je kan vanaf nu ook door naar de volgende vraag.</p>

                <div class="question">
                    <input id="antwoord" type="text" class="search-input" placeholder="Type hier je antwoord...">
                    <button type="button" id="submit-btn">Submit</button>
                    <p><i>Tip: De manier van notatie is als volgt: Q(1(2)/(3),5(4)/(5))</i></p>
                    <p><img src="../../assets/notatie-voorbeeld.png"></p>
                    <p id="feedback" class="hidden"></p>
                </div>
                
            </div>
        </div>

        <iframe scrolling="no" frameBorder="0" title="Eenheidscirkel"
            src="https://www.geogebra.org/material/iframe/id/hrgbuyzm/width/1000/height/569/border/ffffff/sfsb/false/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false"
            width="80%" height="50%" style="position: absolute; right: -28%; top:20%"> </iframe>

        <div class="wrapper">
        <div class="push"></div>
        </div>
        `;}
    else if (questionId === 4) {
            questionContainer.innerHTML = `
            <div class="question">
            <h3>Opdracht 4</h3>
            <br>
            <p><i>Deze opdracht komt overeen met vraag 10.16 in je werkboek.</i></p>
            <br>
            <p>Gegeven zijn de punten A(0, 2) en B(8, 4).</p>
            <p>VHet punt M is het midden van het lijnstuk AB. Ook is het vierkant MBCD getekend.<p/>
            <p><b>Bereken de coördinaten van het midden N van het vierkant.</b></p>
            <br>

            <div class="buttons">
                <p>Open hier de bijbehorende theorie.</p>
                <div class="knoppen">
                <button type="button" class="btn btn-primary btn-lg" onclick="open_theorie_newwindow(10.1)">Theorie</button>
                <button type="button" id="uitwerkingen" class="btn btn-primary btn-lg" data-toggle="modal" data-target=".bd-example-modal-lg" style="visibility:hidden;">Uitwerkingen</button>
                
            <div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <img src="../../assets/vectoren/vector-4-uitwerkingen.png">
                    </div>
                </div>
            </div>
            </div>

                <br><p id="hoop" style="visibility:hidden;">Lukt het niet? Je kan vanaf nu ook door naar de volgende vraag.</p>

                <div class="question">
                    <input id="antwoord" type="text" class="search-input" placeholder="Type hier je antwoord...">
                    <button type="button" id="submit-btn">Submit</button>
                    <p><i>Tip: De manier van notatie is als volgt: Q(1(2)/(3),5(4)/(5))</i></p>
                    <p><img src="../../assets/notatie-voorbeeld.png"></p>
                    <p id="feedback" class="hidden"></p>
                </div>
                
            </div>
        </div>

        <iframe scrolling="no" frameBorder="0" title="Eenheidscirkel"
            src="https://www.geogebra.org/material/iframe/id/xdj3t7es/width/1000/height/569/border/ffffff/sfsb/false/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false"
            width="80%" height="50%" style="position: absolute; right: -28%; top:20%"> </iframe>

        <div class="wrapper">
        <div class="push"></div>
        </div>
`;}



         else {
            questionContainer.innerHTML = `
            <h2>Vraag ${questionId}</h2>
            <p>Deze vraag bestaat nog niet. Kies een andere vraag.</p>
        `;
        }
                function getAnswer(){
                    const form = document.getElementById("quiz-form");
                    if (questionId == 1 || questionId == 3 || questionId == 4){
                        const selectedOption2 = document.getElementById("antwoord");
                        var chosenAnswer = selectedOption2.value;
                        console.log(chosenAnswer);
                    }
                    else {
                        const selectedOption = form.querySelector('input[name="answer"]:checked');
                        var chosenAnswer = selectedOption.value;
                        console.log(chosenAnswer);
                    }
                    return chosenAnswer;
                }
                // Now query the form and other elements after content is loaded
                
    
                // Correct answer
    
                const form = document.getElementById("quiz-form");
                const feedback = document.getElementById("feedback");
                const submitBtn = document.getElementById("submit-btn");

                submitBtn.addEventListener("click", () => {
                    
                    var answer = correctAnswer();
                    var chosenAnswer = getAnswer();
    
                    // If no option is selected, show a warning
                    if (!chosenAnswer) {
                        feedback.textContent = "Vul een antwoord in.";
                        feedback.style.color = "red";
                        feedback.classList.remove("hidden");
                        return;
                    }
    
    
    
                    // Check if the selected answer is correct
                    if (chosenAnswer == answer) {
                        incrementAttempts();
                        feedback.textContent = "Correct!";
                        feedback.style.color = "green";
                        submitBtn.disabled = true;
                        correct();
                    } else {
                        incrementAttempts();
                        feedback.textContent = "Helaas, probeer het opnieuw.";
                        feedback.style.color = "red";
                        showButtonsWhenAttempts();
                    }
    
                    feedback.classList.remove("hidden");
                    
                });
    }

    // Call the function when the page loads





    // Function to get the lesson reference
    export async function getLessonRef() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const userId = user.uid;
                    const lessonRef = doc(getFirestore(), 'users', userId, 'lessons', lessonId);
                    resolve(lessonRef);
                } else {
                    console.error("User is not signed in.");
                    reject(new Error("User not signed in"));
                }
            });
        });
    }




    // Function to mark the lesson as completed
    async function markLessonCompleted() {
        const lessonRef = await getLessonRef();
        try {
            await updateDoc(lessonRef, { completed: true });
            console.log("Lesson marked as completed.");
            window.location.href = `resultaten.html?id=${lessonId}`;
        } catch (error) {
            console.error("Error marking lesson as completed:", error);
        }
    }


    // Initialize the question display and check completion status on page load

    function replaceButton() {
        // Get the original button by its id
        const oldButton = document.getElementById('next');

        // Create the new button element
        const newButton = document.createElement('button');

        // Set the properties for the new button
        newButton.style.visibility = "visible"
        newButton.type = 'button';
        newButton.id = "next"
        newButton.classList.add('btn', 'btn-success');
        newButton.innerText = 'Inleveren';

        // Replace the old button with the new one
        oldButton.parentNode.replaceChild(newButton, oldButton);

        newButton.addEventListener('click', markLessonCompleted);
    }

    function checkQuestionAccess(latestQuestion) {
        // Get the current question ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentQuestion = parseInt(urlParams.get("id"));

        // If the current question is higher than the latestQuestion
        if (currentQuestion > latestQuestion) {

            // Redirect the user back to their latestQuestion
            window.location.href = `${lessonId}.html?id=${latestQuestion}`;
        }   
    }

    // Example usage with a fetched latestQuestion value
    async function fetchAndCheckQuestionAccess() {
        const userDocRef = await getLessonRef();
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const latestQuestion = userDocSnap.data().latestQuestion;

            // Check the user's access to the current question
            checkQuestionAccess(latestQuestion);
        } else {
            console.error("User lesson data not found.");
        }
    }

    fetchAndCheckQuestionAccess();


    
async function showButtonsWhenAttempts() {
    try {
        // Reference to the specific question
        const questionRef = await getQuestionRef();

        // Get the current question data
        const questionSnap = await getDoc(questionRef);

        // If the question exists, increment the attempts
        const currentAttempts = questionSnap.data().attempts || 0;
        if(currentAttempts > 1){
            correctExtra();
            const button = document.getElementById("hoop");
            button.style.visibility = "visible";
        }
        else{
        }
        

    } catch (error) {
        console.error("error"), error;
    }
}


    async function updateButtons() {
        try {
            // Get the current question ID
            const questionId = getQuestionIdFromUrl();

            // Get the lesson reference for updating progress
            const lessonRef = await getLessonRef();
            const docSnap = await getDoc(lessonRef);
            const latestQuestion = docSnap.exists() ? docSnap.data().latestQuestion : 0;
            const currentQuestion = docSnap.exists() ? docSnap.data().current_question : 0;

            // Reference navigation buttons
            const prevButton = document.getElementById("previous");
            const nextButton = document.getElementById("next");
            const submitButton = document.getElementById("submit-btn");
            const uitwerkingenButton = document.getElementById("uitwerkingen");

            // Handle the previous button
            if (questionId === 1) {
                prevButton.style.visibility = "hidden"; // Hide previous button
            } else {
                prevButton.style.visibility = "visible"; // Show previous button
                prevButton.onclick = async function () {
                    const previousQuestion = questionId - 1;
                    await updateDoc(lessonRef, { current_question: previousQuestion });
                    window.location.href = `${lessonId}.html?id=${previousQuestion}`;
                };
            }
            
            if (latestQuestion > currentQuestion){
                submitButton.disabled = true;
            }

            if (latestQuestion > questionId) {
                uitwerkingenButton.style.visibility = "visible";

            }

            // Handle the next button
            if (nextButton) {
                if (latestQuestion == 5 && currentQuestion == 4) {
                    replaceButton();
                }
                else if (latestQuestion > questionId) {
                    nextButton.style.visibility = "visible"; // Show next button
                    nextButton.onclick = async function () {
                        const nextQuestion = questionId + 1;
                        await updateDoc(lessonRef, { current_question: nextQuestion });
                        window.location.href = `${lessonId}.html?id=${nextQuestion}`;
                    };
                } else {
                    nextButton.style.visibility = "hidden"; // Hide next button if no more questions

                }
            }
        } catch (error) {
            console.error("Error initializing navigation buttons:", error);
        }
    }

    async function updateButtonsExtra() {
        try {
            // Get the current question ID
            const questionId = getQuestionIdFromUrl();

            // Get the lesson reference for updating progress
            const lessonRef = await getLessonRef();
            const docSnap = await getDoc(lessonRef);
            const latestQuestion = docSnap.exists() ? docSnap.data().latestQuestion : 0;
            const currentQuestion = docSnap.exists() ? docSnap.data().current_question : 0;

            // Reference navigation buttons
            const prevButton = document.getElementById("previous");
            const nextButton = document.getElementById("next");
            const submitButton = document.getElementById("submit-btn");
            const uitwerkingenButton = document.getElementById("uitwerkingen");

            // Handle the previous button
            if (questionId === 1) {
                prevButton.style.visibility = "hidden"; // Hide previous button
            } else {
                prevButton.style.visibility = "visible"; // Show previous button
                prevButton.onclick = async function () {
                    const previousQuestion = questionId - 1;
                    await updateDoc(lessonRef, { current_question: previousQuestion });
                    window.location.href = `${lessonId}.html?id=${previousQuestion}`;
                };
            }
            

            if (latestQuestion > questionId) {
                uitwerkingenButton.style.visibility = "visible";

            }

            // Handle the next button
            if (nextButton) {
                if (latestQuestion == 5 && currentQuestion == 4) {
                    replaceButton();
                }
                else if (latestQuestion > questionId) {
                    nextButton.style.visibility = "visible"; // Show next button
                    nextButton.onclick = async function () {
                        const nextQuestion = questionId + 1;
                        await updateDoc(lessonRef, { current_question: nextQuestion });
                        window.location.href = `${lessonId}.html?id=${nextQuestion}`;
                    };
                } else {
                    nextButton.style.visibility = "hidden"; // Hide next button if no more questions

                }
            }
        } catch (error) {
            console.error("Error initializing navigation buttons:", error);
        }
    }


    function laadOpdracht() {
        const questionId = getQuestionIdFromUrl();
        document.getElementById("question").innerText = "Opdracht " + questionId;
    }






    async function correct() {
        const lessonRef = await getLessonRef();
        const questionId = getQuestionIdFromUrl();
        const nextQuestion = questionId + 1;
        await updateDoc(lessonRef, { latestQuestion: nextQuestion });
        updateButtons();
    }

    async function correctExtra() {
        const lessonRef = await getLessonRef();
        const questionId = getQuestionIdFromUrl();
        const nextQuestion = questionId + 1;
        await updateDoc(lessonRef, { latestQuestion: nextQuestion });
        updateButtonsExtra();
    }
    // Call the function when the page loads






    window.onload = function () {
        loadQuestionContent();
        updateButtons();
        laadOpdracht();
    };
