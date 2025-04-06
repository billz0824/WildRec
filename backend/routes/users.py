from flask import Blueprint, request, jsonify
from models.course import Course
from models.user import User
from app import db

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<int:user_id>/save_course', methods=['POST'])
def save_course(user_id):
    data = request.get_json()
    course_id = data.get('course_id')
    user = User.query.get_or_404(user_id)
    course = Course.query.get_or_404(course_id)
    if course not in user.saved_courses:
        user.saved_courses.append(course)
        db.session.commit()
    return jsonify({"message": "Course saved successfully."})

@users_bp.route('/<int:user_id>/saved_courses', methods=['GET'])
def get_saved_courses(user_id):
    user = User.query.get_or_404(user_id)
    courses = user.saved_courses

    result = []
    for course in courses:
        result.append({
            "id": course.id,
            "number": course.number,
            "name": course.name,
            "professor": course.professor,
            "quote": course.quote,
            "requirements": course.requirements,
            "prerequisites": course.prerequisites,
            "description": course.description,
            "radar": {
                "liked": course.liked,
                "difficulty": course.difficulty,
                "practicality": course.practicality,
                "collaborative": course.collaborative,
                "rewarding": course.rewarding,
                "instruction": course.instruction,
            }
        })

    return jsonify(result)


@users_bp.route('/create', methods=['POST'])
def create_user():
    data = request.get_json()

    email = data.get('email')
    major = data.get('major')
    goal_description = data.get('goal_description', "")

    # Optional radar prefs
    liked = data.get('liked', 0)
    difficulty = data.get('difficulty', 0)
    practicality = data.get('practicality', 0)
    collaborative = data.get('collaborative', 0)
    rewarding = data.get('rewarding', 0)
    instruction = data.get('instruction', 0)

    past_classes = data.get('past_classes', [])
    top_classes = data.get('top_classes', [])

    if not email or not major:
        return jsonify({"error": "Missing required fields: email and major"}), 400

    # ✅ Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({
            "message": "User already exists.",
            "user_id": existing_user.id
        }), 200

    username = email.split('@')[0]

    user = User(
        email=email,
        username=username,
        major=major,
        goal_description=goal_description,
        liked=liked,
        difficulty=difficulty,
        practicality=practicality,
        collaborative=collaborative,
        rewarding=rewarding,
        instruction=instruction,
        past_classes=past_classes,
        top_classes=top_classes
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user_id": user.id}), 201

@users_bp.route('/<int:user_id>/embedding_data', methods=['GET'])
def get_embedding_data(user_id):
    user = User.query.get_or_404(user_id)
    
    # Get list of course numbers the user has already taken
    past_course_numbers = user.past_classes or []

    # Filter out courses the user already took
    available_courses = Course.query.filter(~Course.number.in_(past_course_numbers)).all()

    # Structure user data
    user_data = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "major": user.major,
        "goal_description": user.goal_description,
        "past_classes": user.past_classes,
        "top_classes": user.top_classes,
        "radar": {
            "liked": user.liked,
            "difficulty": user.difficulty,
            "practicality": user.practicality,
            "collaborative": user.collaborative,
            "rewarding": user.rewarding,
            "instruction": user.instruction,
        }
    }

    # Structure course data
    course_data = []
    for course in available_courses:
        course_data.append({
            "id": course.id,
            "number": course.number,
            "name": course.name,
            "professor": course.professor,
            "quote": course.quote,
            "requirements": course.requirements,
            "prerequisites": course.prerequisites,
            "description": course.description,
            "content_summary": course.content_summary,
            "experience_summary": course.experience_summary,
            "radar": {
                "liked": course.liked,
                "difficulty": course.difficulty,
                "practicality": course.practicality,
                "collaborative": course.collaborative,
                "rewarding": course.rewarding,
                "instruction": course.instruction,
            }
        })

    return jsonify({
        "user": user_data,
        "courses": course_data
    })

