import { options } from '../config/tmdb.js';
import { updateDB } from './updateDB.js';
import { search } from './search.js';

export function getMovie(titleID) {
    // Get movie information from stored movie ID
    var req = 'https://api.themoviedb.org/3/movie/' + titleID;
    fetch(req, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

export function searchTitle(title) {
    var req = 'https://api.themoviedb.org/3/search/movie?query=' + title;
    fetch(req, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}