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

// Redirect to the login page if the user is not authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Logout handling
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut()
    .then(() => {
        // Redirect to login page or desired page
        window.location.href = 'login.html';
    })
    .catch((error) => {
        // Handle logout error
        console.log(error);
    });
});

// Handle form submission
const addMovieForm = document.getElementById('add-movie-form');
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = addMovieForm['title'].value;
    const director = addMovieForm['director'].value;

    // Add movie to Firebase Realtime Database
    const currentUser = firebase.auth().currentUser;
    const userRef = firebase.database().ref(`users/${currentUser.uid}`);
    const moviesRef = userRef.child('movies');
    const newMovieRef = moviesRef.push();
    newMovieRef.set({ title, director });

    // Clear form fields
    addMovieForm.reset();
});

// Display list of movies for the current user
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const userRef = firebase.database().ref(`users/${user.uid}`);
        userRef.child('movies').on('value', (snapshot) => {
        const movies = snapshot.val();
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';
        for (const movieKey in movies) {
            const movie = movies[movieKey];
            const movieItem = document.createElement('li');
            movieItem.innerHTML = `<strong>${movie.title}</strong> directed by ${movie.director}`;
            movieList.appendChild(movieItem);
        }
        });
    } else {
        window.location.href = 'login.html';
    }
});