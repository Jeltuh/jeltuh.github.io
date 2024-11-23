import { getFirestore, doc, getDoc, collection, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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
    
onAuthStateChanged(auth, async (user) => {
    if (user) {
}   else {
    window.location.href = "../../index.html";
    const white = document.body;
    white.style.backgroundColor = "rgba(255, 255, 255, 1)";
    white.style.position = "fixed";
    white.style.top = "0";
    white.style.left = "0";
    white.style.width = "100vw";
    white.style.height = "100vh";
    white.style.zIndex = "9999";
    white.style.display = "none";

    
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

        // Initialize the lessons collection for the user with 'lessonehc' and 'raaklijn'
        const lessonsRef = doc(db, "users", user.uid, "lessons", "lessonehc");
        await setDoc(lessonsRef, {
            completed: false,
            current_question: 1, // Starting with the first question
            latestQuestion: 1 // Set to the first question as well
        });

        const lessonsRef2 = doc(db, "users", user.uid, "lessons", "raaklijn");
        await setDoc(lessonsRef2, {
            completed: false,
            current_question: 1, // Starting with the first question
            latestQuestion: 1 // Set to the first question as well
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
});