// Initialize Firebase app
import { firebaseConfig } from '../config/firebase.js';
firebase.initializeApp(firebaseConfig);

// Signup form handling
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signupForm['email'].value;
    const password = signupForm['password'].value;

    // Create user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
        // Redirect to movie list page or desired page
        window.location.href = '../index.html';
    })
    .catch((error) => {
        // Handle signup error
        console.log(error);
    });

    // Clear form fields
    signupForm.reset();
});