import re  # For email validation
from faker import Faker
from flask import request, jsonify
from app import app, db, bcrypt
from app.models import User, Score
from flask_jwt_extended import create_access_token, jwt_required, jwt_required, get_jwt_identity

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
    # Generate a realistic paragraph using Faker
    paragraph_text = fake.text(max_nb_chars=500)
    # Remove newline characters
    paragraph_text = paragraph_text.replace('\n', ' ')
    return jsonify({"paragraph": paragraph_text})

@app.route("/scores", methods=["GET"])
@jwt_required()
def get_scores():
    scores = Score.query.order_by(Score.score.desc()).limit(10).all()
    results = [{"username": score.user.username, "score": score.score} for score in scores]
    return jsonify({"scores": results})

# New route to get all users with their username and email
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    users_list = [{"username": user.username, "email": user.email} for user in users]
    return jsonify({"users": users_list})

@app.route("/update_user", methods=["PUT"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()  # Get user ID from JWT
    data = request.get_json()

    # Find the user by their ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Optional: Validate input before updating
    if data.get("username"):
        user.username = data["username"]
    if data.get("email"):
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already exists"}), 400
        user.email = data["email"]

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

@app.route("/delete_user", methods=["DELETE"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()  # Get user ID from JWT
    
    # Find the user by their ID
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Delete the user from the database
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200
