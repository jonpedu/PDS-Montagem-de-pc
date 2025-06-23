import os
import uuid

from flask import Flask, send_file
from flask import request, redirect, url_for, jsonify, render_template, session
from flask import make_response
from werkzeug.security import generate_password_hash


app = Flask(__name__, template_folder='src')
app.secret_key = 'your_secret_key_here' # Replace with a real, secret key

@app.route("/")
def index():
    return send_file('src/index.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password)
        user_id = uuid.uuid4()

        # Placeholder for database interaction
        # In a real application, you would insert the user into the database here.
        print(f"Simulating user registration: User ID: {user_id}, Email: {email}, Hashed Password: {hashed_password}")

        return redirect(url_for('login'))  # Redirect to login page after simulated successful registration
    return send_file('src/register.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
 if request.method == 'POST':
 # In a real application, you would authenticate the user here
 # Simulate successful login for now
 # For demonstration, passing a placeholder username via query parameter
 # Using session to pass data securely instead of query parameters
    session['username'] = "SimulatedUser" # Replace with actual username after authentication
    return redirect(url_for('chatbot'))
 return send_file('src/login.html')

@app.route("/chatbot")
def chatbot():
    # In a real application, retrieve the username from the session
    username = session.get('username', 'Guest')  # Get username from session
    return render_template('chatbot.html', username=username) # Pass username to the template

def main():
    app.run(port=int(os.environ.get('PORT', 80)))

if __name__ == "__main__":
    main()

@app.route("/profile")
def profile():
    # In a real application, fetch user data based on the logged-in user
    # For now, just render the profile page using render_template
    return render_template('profile.html')