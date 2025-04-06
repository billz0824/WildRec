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

    # Safely extract radar values (default to 0 if not provided)
    radar = data.get('radar', {})
    liked = radar.get('liked', 0)
    difficulty = radar.get('difficulty', 0)
    practicality = radar.get('practicality', 0)
    collaborative = radar.get('collaborative', 0)
    rewarding = radar.get('rewarding', 0)
    instruction = radar.get('instruction', 0)

    # Extract top-level fields
    name = data.get('name')
    professor = data.get('professor')
    quote = data.get('slogan')  # maps "slogan" in JSON to "quote" field in DB
    requirements = data.get('requirements', [])
    prerequisites = data.get('prerequisites', [])
    description = data.get('description')
    content_summary = data.get('content_summary')
    experience_summary = data.get('experience_summary')

    course = Course.query.filter_by(number=number).first()

    if course:
        course.name = name or course.name
        course.professor = professor or course.professor
        course.quote = quote or course.quote
        course.requirements = requirements or course.requirements
        course.prerequisites = prerequisites or course.prerequisites
        course.description = description or course.description
        course.liked = liked
        course.difficulty = difficulty
        course.practicality = practicality
        course.collaborative = collaborative
        course.rewarding = rewarding
        course.instruction = instruction
        course.content_summary = content_summary or course.content_summary
        course.experience_summary = experience_summary or course.experience_summary
        msg = "Course updated."
    else:
        course = Course(
            number=number,
            name=name,
            professor=professor,
            quote=quote,
            requirements=requirements,
            prerequisites=prerequisites,
            description=description,
            liked=liked,
            difficulty=difficulty,
            practicality=practicality,
            collaborative=collaborative,
            rewarding=rewarding,
            instruction=instruction,
            content_summary=content_summary,
            experience_summary=experience_summary
        )
        db.session.add(course)
        msg = "Course created."

    db.session.commit()
    return jsonify({"message": msg, "course_id": course.id})
