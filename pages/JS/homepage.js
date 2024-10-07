import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"


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

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    if(loggedInUserId){
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserFName').innerText=userData.firstName;
                document.getElementById('loggedUserEmail').innerText=userData.email;
                document.getElementById('loggedUserLName').innerText=userData.lastName;

            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("Error getting document");
        })
    }
    else{
        console.log("User Id not Found in Local storage")
    }
  })

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='../../index.html';
    })
    .catch((error)=>{
        console.error('Error Signing out:', error);
    })
  })