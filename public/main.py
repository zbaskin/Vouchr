import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from flask import Flask, request, jsonify

app = Flask(__name__)
cred = credentials.Certificate('firebase/credentials.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://vouchr-9221a.firebaseio.com/'
})
users_ref = db.reference('users')


@app.route('/users/<username>/movies', methods=['GET'])
def get_movies(username):
    user_ref = users_ref.child(username)
    movies = user_ref.child('movies').get()
    if movies:
        return jsonify(movies)
    else:
        return jsonify({'message': 'User not found.'}), 404


@app.route('/users/<username>/movies', methods=['POST'])
def add_movie(username):
    user_ref = users_ref.child(username)
    movie = request.get_json()
    movies_ref = user_ref.child('movies')
    movies_ref.push(movie)

    return jsonify({'message': 'Movie added to the user\'s list.'}), 201


if __name__ == '__main__':
    app.run(debug=True)
