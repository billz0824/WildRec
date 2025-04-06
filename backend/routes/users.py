from flask import Blueprint, request, jsonify
from ..models.course import Course
from ..models.user import User
from ..db import db
from .rec_sys import merge
from ..rec_sys.digraph import build_course_graph
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')  
# or the absolute path if you prefer
load_dotenv(dotenv_path=dotenv_path)


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
            "radarData": {
                "liked": course.liked,
                "difficulty": course.difficulty,
                "practicality": course.practicality,
                "collaborative": course.collaborative,
                "rewarding": course.rewarding,
                "instruction": course.instruction,
            }
        })

    return jsonify(result)

@users_bp.route('/<int:user_id>/unsave_course', methods=['POST'])
def unsave_course(user_id):
    data = request.get_json()
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"error": "Missing course_id in request body"}), 400

    user = User.query.get_or_404(user_id)
    course = Course.query.get_or_404(course_id)

    # Remove the association if it exists
    if course in user.saved_courses:
        user.saved_courses.remove(course)
        db.session.commit()
        return jsonify({"message": "Course unsaved successfully"}), 200
    else:
        return jsonify({"error": "Course not found in user's saved courses"}), 404


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


@users_bp.route('/get_recommended_courses/<int:user_id>', methods=['GET'])
def get_recommended_courses(user_id):
    user = User.query.get_or_404(user_id)


    # This is a placeholder. Replace with your actual recommendation logic!
    recommended_courses = Course.query.limit(10).all()

    course_list = []
    for course in recommended_courses:
        course_list.append({
            "id": course.id,
            "number": course.number,
            "name": course.name,
            "professor": course.professor,
            "quote": course.quote,
            "requirements": course.requirements,
            "prerequisites": course.prerequisites,
            "description": course.description,
            "radarData": {
                "liked": course.liked,
                "difficulty": course.difficulty,
                "practicality": course.practicality,
                "collaborative": course.collaborative,
                "rewarding": course.rewarding,
                "instruction": course.instruction,
            }
        })

    return jsonify({"courses": course_list})


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



# @users_bp.route('/get_recommended_courses/<int:user_id>', methods=['GET'])
# def get_recommended_courses(user_id):
#     user = User.query.get_or_404(user_id)

#     courses = Course.query.all()
    
#     # Structure user data
#     user_data = {
#         "user_id": user.id,
#         "email": user.email,
#         "username": user.username,
#         "major": user.major,
#         "goal_description": user.goal_description,
#         "past_classes": user.past_classes,
#         "top_classes": user.top_classes,
#         "radar": {
#             "liked": user.liked,
#             "difficulty": user.difficulty,
#             "practicality": user.practicality,
#             "collaborative": user.collaborative,
#             "rewarding": user.rewarding,
#             "instruction": user.instruction,
#         }
#     }

#     # Structure course data
#     course_data = []
#     for course in courses:
#         course_data.append({
#             "id": course.id,
#             "number": course.number,
#             "name": course.name,
#             "professor": course.professor,
#             "quote": course.quote,
#             "requirements": course.requirements,
#             "prerequisites": course.prerequisites,
#             "description": course.description,
#             "content_summary": course.content_summary,
#             "experience_summary": course.experience_summary,
#             "radar": {
#                 "liked": course.liked,
#                 "difficulty": course.difficulty,
#                 "practicality": course.practicality,
#                 "collaborative": course.collaborative,
#                 "rewarding": course.rewarding,
#                 "instruction": course.instruction,
#             }
#         })
    
#     course_graph = build_course_graph(course_data)
#     recommended_courses = merge(user_data, course_data, course_graph, top_n=3)

#     return jsonify({"courses": recommended_courses})