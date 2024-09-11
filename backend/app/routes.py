from faker import Faker
from flask import request, jsonify
from app import app, db, bcrypt
from app.models import User, Score
from flask_jwt_extended import create_access_token, jwt_required

fake = Faker()

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
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
