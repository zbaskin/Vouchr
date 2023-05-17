// Initialize Firebase app
import { firebaseConfig } from './config/firebase.js';
firebase.initializeApp(firebaseConfig);

// Login form handling
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm['email'].value;
    const password = loginForm['password'].value;

    // Sign in with email and password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
        // Redirect to movie list page or desired page
        window.location.href = 'index.html';
        })
        .catch((error) => {
        // Handle login error
        console.log(error);
        });

    // Clear form fields
    loginForm.reset();
});