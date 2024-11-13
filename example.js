// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
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
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
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
    <footer class="footer">
        <button type="button" class="btn btn-primary" id="startbutton">Vorige</button>
        <p>Opdracht 1</p>
        <button type="button" class="btn btn-primary" id="nextQuestionButton">Volgende</button>
    </footer>
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
          async function goToNextQuestion() {
              try {
                  // Increment `current_question` by 1
                  const nextQuestion = questionId + 1;
                  await updateDoc(lessonRef, { current_question: nextQuestion });
          
                  // Redirect to the next question page with the updated `id`
                  window.location.href = `test2.html?id=${nextQuestion}`;
              } catch (error) {
                  console.error("Error going to next question:", error);
              }
          }
          
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
                          completionMessage.style.display = 'block';  // Show the message
                      } else {
                          completionMessage.style.display = 'none';  // Hide the message
                      }
                  }
              } catch (error) {
                  console.error("Error checking lesson completion:", error);
              }
          }
          
          // Event listener for the "Next Question" button
          document.getElementById('nextQuestionButton').addEventListener('click', goToNextQuestion);
          
          // Event listener for the "Mark Completed" button
          document.getElementById('markCompletedButton').addEventListener('click', markLessonCompleted);
          
          // Initialize the question display and check completion status on page load
          window.onload = function() {
              initializeCurrentQuestion();
              checkLessonCompletion();
              loadQuestionContent();
          };
          
          




          <!DOCTYPE html>
          <html lang="en">
          
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Opdracht</title>
          
          
          
          
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
                  integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
          
              <link rel="stylesheet" href="../../styles/vragen.css">
              <link rel="stylesheet" href="../../styles/test.css">
          
              <script src="../JS/functions.js"></script>
          
          
          </head>
          
          <body>
              <header>
                  <nav class="navbar fixed-top navbar-expand-sm navbar-light bg-light py-3" style="background-color: #0d1117;">
                      <a class="navbar-brand" href="../../index.html">Placeholder</a>
                      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                          <span class="navbar-toggler-icon"></span>
                      </button>
          
                      <div class="collapse navbar-collapse" id="navbarSupportedContent">
                          <ul class="navbar-nav ">
                              <li class="nav-item dropdown">
                                  <a class="nav-link dropdown-toggle" href="#" id="navbareDropdown" role="button"
                                      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      Library
                                  </a>
                                  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                      <a class="dropdown-item" href="./libraryvwo4.html">Getal en Ruimte VWO 4</a>
                                      <a class="dropdown-item" href="./libraryvwo5.html">Getal en Ruimte VWO 5</a>
                                      <div class="dropdown-divider"></div>
                                      <a class="dropdown-item" href="./library.html">Alle opdrachten</a>
                                  </div>
                              </li>
                              <li class="nav-item dropdown">
                                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      Theorie
                                  </a>
                                  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                      <a class="dropdown-item" href="./theorievwo4.html">Getal en Ruimte VWO 4</a>
                                      <a class="dropdown-item" href="./theorievwo5.html">Getal en Ruimte VWO 5</a>
                                      <div class="dropdown-divider"></div>
                                      <a class="dropdown-item" href="./theorie.html">Alle theorie</a>
                                  </div>
                              </li>
                              <li class="nav-item">
                                  <a class="nav-link" href="./hoewerkthet.html">Hoe werkt het?</a>
                              </li>
                              <li class="nav-item">
                                  <a class="nav-link" href="./contact.html">Contact</a>
                              </li>
                          </ul>
                          <form class="form-inline my-2 my-lg-0 mx-auto">
                              <input class="form-control mr-sm-2" type="search" placeholder="Search..." aria-label="Search">
                              <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</i></button>
                          </form>
                          
                          <div class="d-flex justify-content-end">
                              <div class="btn-group">
                              <!-- Account Dropdown (shown when logged in) -->
                              <button class="btn btn-secondary dropdown-toggle" type="button" id="accountDropdown"
                                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Account
                              </button>
                              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="accountDropdown">
                                  <li><span class="dropdown-item">Points: <span id="accountPoints">0</span></span></li>
                                  <li>
                                      <hr class="dropdown-divider">
                                  </li>
                                  <li><button id="openAccountModal" class="dropdown-item">Personal details</button></li>
                                  <li><button id="logoutButton" class="dropdown-item">Logout</button></li>
                              </div>
                              </div>
          
                              <!-- Login Button (shown when not logged in) -->
                              <button id="loginButton" class="btn btn-primary" data-toggle="modal"
                                  data-target="#loginModal">Login</button>
                              <!-- Login Modal -->
                              <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel"
                                  aria-hidden="true">
                                  <div class="modal-dialog">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="loginModalLabel">Login</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <input type="email" id="emailInput" class="form-control mb-3" placeholder="Email">
                                              <input type="password" id="passwordInput" class="form-control mb-3"
                                                  placeholder="Password">
                                              <button id="loginSubmitButton" class="btn btn-primary w-100">Login</button>
                                              <p class="mt-3 text-center">
                                                  Don’t have an account? <a href="#" id="openRegisterModal">Register here</a>
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
          
                              <!-- Register Modal -->
                              <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel"
                                  aria-hidden="true">
                                  <div class="modal-dialog">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="registerModalLabel">Register</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <input type="text" id="firstNameInput" class="form-control mb-3"
                                                  placeholder="First Name">
                                              <input type="text" id="lastNameInput" class="form-control mb-3"
                                                  placeholder="Last Name">
                                              <input type="email" id="registerEmailInput" class="form-control mb-3"
                                                  placeholder="Email">
                                              <input type="password" id="registerPasswordInput" class="form-control mb-3"
                                                  placeholder="Password">
                                              <button id="registerSubmitButton" class="btn btn-primary w-100">Register</button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
          
                              <!-- Account Modal -->
                              <div class="modal fade" id="accountModal" tabindex="-1" role="dialog"
                                  aria-labelledby="accountModalLabel" aria-hidden="true">
                                  <div class="modal-dialog modal-lg" role="document">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="accountModalLabel">Account Settings</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <div class="row">
                                                  <!-- Sidebar Navigation -->
                                                  <div class="col-md-4">
                                                      <div class="list-group">
                                                          <a href="#accountDetails"
                                                              class="list-group-item list-group-item-action active"
                                                              data-toggle="list">Account Details</a>
                                                          <a href="#" class="list-group-item list-group-item-action text-danger"
                                                              id="logoutButton2">Logout</a>
                                                      </div>
                                                  </div>
                                                  <!-- Main Content Area -->
                                                  <div class="col-md-8">
                                                      <div class="tab-content">
                                                          <!-- Account Details Section -->
                                                          <div class="tab-pane fade show active" id="accountDetails">
                                                              <h3>Account Details</h3>
          
                                                              <!-- First Name and Last Name Update Form -->
                                                              <form id="nameForm">
                                                                  <div class="form-group">
                                                                      <label for="firstName">First Name</label>
                                                                      <input type="text" class="form-control" id="firstName"
                                                                          placeholder="Enter first name">
                                                                  </div>
                                                                  <div class="form-group">
                                                                      <label for="lastName">Last Name</label>
                                                                      <input type="text" class="form-control" id="lastName"
                                                                          placeholder="Enter last name">
                                                                  </div>
                                                                  <button type="submit" class="btn btn-primary">Save Name
                                                                      Changes</button>
                                                              </form>
          
                                                              <hr>
          
                                                              <!-- Password Update Form -->
                                                              <form id="passwordForm">
                                                                  <h5>Change Password</h5>
                                                                  <div class="form-group">
                                                                      <label for="oldPassword">Current Password</label>
                                                                      <input type="password" class="form-control" id="oldPassword"
                                                                          placeholder="Enter current password">
                                                                  </div>
                                                                  <div class="form-group">
                                                                      <label for="newPassword">New Password</label>
                                                                      <input type="password" class="form-control" id="newPassword"
                                                                          placeholder="Enter new password">
                                                                  </div>
                                                                  <div class="form-group">
                                                                      <label for="confirmNewPassword">Confirm New Password</label>
                                                                      <input type="password" class="form-control"
                                                                          id="confirmNewPassword"
                                                                          placeholder="Confirm new password">
                                                                  </div>
                                                                  <button type="submit" class="btn btn-primary">Save Password
                                                                      Changes</button>
                                                              </form>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div class="modal-footer">
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                  </nav>
              </header>
          
              <br><br><br>
              <div id="body-text"></div>
          
          
              <div id="snackbar"></div>
              <!-- -->
          
            
          
              <h1 id="currentQuestionDisplay">Loading...</h1>
              <button id="nextQuestionButton">Next Question</button>
              <button id="markCompletedButton">Mark Lesson as Completed</button>
          
              <p id="completionMessage" style="display: none;">Congratulations, you have completed the lesson!</p>
              <button id="addPointsButton"></button>
              <p id="displayFirstName"></p>
          
          
              <div class="wrapper">
                  <div class="push"></div>
              </div>
              <footer class="footer">
                  <button type="button" class="btn btn-primary" id="startbutton">Vorige</button>
                  <p>Opdracht 1</p>
                  <button type="button" class="btn btn-primary" onclick="ehc_opgave(2)">Volgende</button>
              </footer>
          
              <div>
                  <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"
                      integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
                      crossorigin="anonymous"></script>
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
                      integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct"
                      crossorigin="anonymous"></script>
                  <script>
                      $(function () {
                          $('[data-toggle="popover"]').popover()
                      })
                      $('.popover-dismiss').popover({
                          trigger: 'focus'
                      })
                  </script>
                  <script type="module" src="../JS/test.js"></script>
              </div>
          
          </body>
          
          </html>