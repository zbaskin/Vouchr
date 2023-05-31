import { options } from './config/tmdb.js';
import { getMovie } from './functions/tmdb-api.js';

// Initialize Firebase app
import { firebaseConfig } from './config/firebase.js';
firebase.initializeApp(firebaseConfig);

// Redirect to the login page if the user is not authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = './index.html';
    }
});

// Logout handling
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut()
    .then(() => {
        // Redirect to login page or desired page
        window.location.href = '/index.html';
    })
    .catch((error) => {
        // Handle logout error
        console.log(error);
    });
});

// Remove options from title search dropdown
function removeOptions(element) {
    for (let i = element.options.length - 1; i >= 0; i--) {
        element.remove(i);
    }
}

// Update film search box
const movieTitleSearch = document.getElementById('title');
movieTitleSearch.addEventListener('change', (e) => {
    e.preventDefault();

    var title = movieTitleSearch.value;
    var search = document.getElementById('search');
    if (document.getElementById('title').value == null) {
        search.style.display = 'none';
        return;
    }

    search.style.display = 'inline-block';
    var req = 'https://api.themoviedb.org/3/search/movie?query=' + title;
    fetch(req, options)
        .then(response => response.json())
        .then(response => {
            removeOptions(search);
            var numResults = response.results.length;
            if (numResults == 0) {
                search.style.display = 'none';
                return;
            }

            var maxLength = Math.min(numResults, 5);
            for (let i = 0; i < maxLength; i++) {
                var searchResult = document.createElement('option');
                var resultID = response.results[i].id;
                var resultTitle = response.results[i].title;
                searchResult.value = resultID;
                searchResult.text = resultTitle;
                search.add(searchResult);
            }
        })
        .catch(err => console.error(err));
});

// Handle form submission
const addMovieForm = document.getElementById('add-movie-form');
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleID = addMovieForm['search'].value;
    if (titleID == null || titleID == '') {
        return;
    }

    // Add movie to Firebase Realtime Database
    const currentUser = firebase.auth().currentUser;
    const userRef = firebase.database().ref(`users/${currentUser.uid}`);
    const moviesRef = userRef.child('movies');
    const newMovieRef = moviesRef.push();
    newMovieRef.set({ titleID });

    // Clear form fields
    addMovieForm.reset();
    removeOptions(document.getElementById('search'));
    document.getElementById('search').style.display = 'none';
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

            // Get movie title information from stored movie ID
            var req = 'https://api.themoviedb.org/3/movie/' + movie.titleID;
            fetch(req, options)
                .then(response => response.json())
                .then(response => {
                    movieItem.innerHTML += `<span class="movie-title"><strong>${response.title}</strong></span>`;
                })
                .then(() => {
                    // Get director information from stored movie ID
                    var req = 'https://api.themoviedb.org/3/movie/' + movie.titleID + '/credits';
                    fetch(req, options)
                        .then(response => response.json())
                        .then(response => {
                            var director = response.crew.filter(({job}) => job === 'Director');
                            movieItem.innerHTML += `directed by <strong>${director[0].name}</strong>`;
                        });
                })
                .catch(err => console.error(err));

            movieList.appendChild(movieItem);
        }
        });
    } else {
        window.location.href = './index.html';
    }
});