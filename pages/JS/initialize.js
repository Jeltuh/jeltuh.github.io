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
    
    onAuthStateChanged(auth, async (user) => {
if (user) {
} else {
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
});