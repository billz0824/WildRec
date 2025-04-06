from flask import Blueprint, request, jsonify
from ..models.course import Course
from ..db import db

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@courses_bp.route('/by_number/<string:course_number>', methods=['GET'])
def get_course_by_number(course_number):
    course = Course.query.filter_by(number=course_number).first()
    if not course:
        return jsonify({"error": "Course not found."}), 404

    return jsonify({
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

@courses_bp.route('/by_id/<int:course_id>', methods=['GET'])
def get_course_by_id(course_id):
    course = Course.query.get_or_404(course_id)
    return jsonify({
        'id': course.id,
        'number': course.number,
        'name': course.name,
        'professor': course.professor,
        'quote': course.quote,
        'requirements': course.requirements,
        'prerequisites': course.prerequisites,
        'description': course.description,
        'radar': {
            'liked': course.liked,
            'difficulty': course.difficulty,
            'practicality': course.practicality,
            'collaborative': course.collaborative,
            'rewarding': course.rewarding,
            'instruction': course.instruction,
        }
    })


@courses_bp.route('/add-update', methods=['POST'])
def add_or_update_course():
    data = request.get_json()

    number = data.get('number')
    if not number:
        return jsonify({"error": "Course number is required."}), 400

    course = Course.query.filter_by(number=number).first()

    if course:
        course.name = data.get('name', course.name)
        course.professor = data.get('professor', course.professor)
        course.quote = data.get('quote', course.quote)
        course.requirements = data.get('requirements', course.requirements)
        course.prerequisites = data.get('prerequisites', course.prerequisites)
        course.description = data.get('description', course.description)
        course.liked = data.get('liked', course.liked)
        course.difficulty = data.get('difficulty', course.difficulty)
        course.practicality = data.get('practicality', course.practicality)
        course.collaborative = data.get('collaborative', course.collaborative)
        course.rewarding = data.get('rewarding', course.rewarding)
        course.instruction = data.get('instruction', course.instruction)
        msg = "Course updated."
    else:
        course = Course(
            number=number,
            name=data.get('name'),
            professor=data.get('professor'),
            quote=data.get('quote'),
            requirements=data.get('requirements', []),
            prerequisites=data.get('prerequisites', []),
            description=data.get('description'),
            liked=data.get('liked', 0),
            difficulty=data.get('difficulty', 0),
            practicality=data.get('practicality', 0),
            collaborative=data.get('collaborative', 0),
            rewarding=data.get('rewarding', 0),
            instruction=data.get('instruction', 0)
        )
        db.session.add(course)
        msg = "Course created."

    db.session.commit()
    return jsonify({"message": msg, "course_id": course.id})