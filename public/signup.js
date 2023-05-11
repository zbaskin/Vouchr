// Initialize Firebase app
const firebaseConfig = {
    apiKey: "AIzaSyD3R2uh_DLnmkjQEhHo-cLj7RVANdFIw3w",
    authDomain: "vouchr-9221a.firebaseapp.com",
    projectId: "vouchr-9221a",
    storageBucket: "vouchr-9221a.appspot.com",
    messagingSenderId: "785980302686",
    appId: "1:785980302686:web:bba9f2673d2574ab5e1bcf",
    measurementId: "G-39Z1CQBWRL"
};
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
        window.location.href = 'index.html';
    })
    .catch((error) => {
        // Handle signup error
        console.log(error);
    });

    // Clear form fields
    signupForm.reset();
});