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