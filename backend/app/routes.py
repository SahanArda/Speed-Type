import re  # For email validation
from faker import Faker
from flask import request, jsonify
from app import app, db, bcrypt
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

CORS(app)

fake = Faker()

# Email format validation function
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email)

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Ensure all fields are provided and not empty (including not just spaces)
    if not data.get("username") or not data["username"].strip():
        return jsonify({"message": "Username is required"}), 400
    if not data.get("email") or not data["email"].strip():
        return jsonify({"message": "Email is required"}), 400
    if not data.get("password") or not data["password"].strip():
        return jsonify({"message": "Password is required"}), 400

    # Check if email is in the correct format
    if not is_valid_email(data["email"]):
        return jsonify({"message": "Invalid email format"}), 400
    
    # Check if email is unique
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400
    
    # Validate password length
    if len(data["password"]) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400

    # If all validations pass, create the user
    user = User(username=data["username"], email=data["email"])
    user.set_password(data["password"])
    
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/generated_paragraph", methods=["GET"])
@jwt_required()
def generate_paragraph():
    # Generate a longer text using Faker
    paragraph_text = fake.text(max_nb_chars=500)  # Generate a paragraph with a maximum of 500 characters
    # Remove newline characters and ensure it's continuous text
    paragraph_text = paragraph_text.replace('\n', ' ')
    
    return jsonify({
        "paragraph": paragraph_text,
    })


# Route to get all users with their username and email
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()  # Fetch all users from the database
    results = [
        {"id": user.id, "username": user.username, "email": user.email}
        for user in users
    ]
    return jsonify({"users": results}), 200

@app.route("/update_user", methods=["PUT"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()  # Get user ID from JWT
    data = request.get_json()

    print(f"Update request data: {data}")  # Debugging line

    # Find the user by their ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    # If "username" is provided in the request, validate and update it
    if "username" in data:
        print(f"Updating username to: {data['username']}")  # Debugging line
        if not data["username"].strip():
            return jsonify({"message": "Username cannot be empty"}), 400
        user.username = data["username"]

    # If "email" is provided in the request, validate and update it
    if "email" in data:
        print(f"Updating email to: {data['email']}")  # Debugging line
        if not data["email"].strip():
            return jsonify({"message": "Email cannot be empty"}), 400
        if not is_valid_email(data["email"]):
            return jsonify({"message": "Invalid email format"}), 400
        # Ensure email is unique for other users (excluding the current user)
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({"message": "Email already exists"}), 400
        user.email = data["email"]

    # If "password" is provided in the request, validate and update it
    if "password" in data:
        print(f"Updating password")
        if len(data["password"]) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400
        user.set_password(data["password"])

    # Commit the changes to the database
    try:
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        print(f"Error during commit: {str(e)}")
        return jsonify({"message": "An error occurred while updating the user"}), 500

@app.route("/delete_user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    # Find the user by their ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Delete the user from the database
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200
