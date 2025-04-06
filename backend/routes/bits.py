from flask import Blueprint, request, jsonify
from models.course import Course
from models.bit import Bit
from models.user import User
from app import db

bits_bp = Blueprint('bits', __name__, url_prefix='/api/bits')

@bits_bp.route('/get_bits/<int:user_id>', methods=['GET'])
def get_bits_by_user(user_id):
    user = User.query.get_or_404(user_id)

    # TODO: Implement logic to fetch bits for the user
    bits = []

    result = []
    for bit in bits:
        result.append({
            "id": bit.id,
            "course_id": bit.course_id,
            "content": bit.content,
            "media": bit.media,
            "content_type": bit.content_type,
            "created_at": bit.created_at.isoformat()
        })

    return jsonify(result)

@bits_bp.route('/like/<int:user_id>/<int:bit_id>', methods=['GET'])
def like_bits(user_id, bit_id):
    user = User.query.get_or_404(user_id)
    bit = Bit.query.get_or_404(bit_id)

    return jsonify({
        "message": f"User {user.username} liked Bit {bit.id}",
        "bit_id": bit.id,
        "user_id": user.id
    })


@bits_bp.route('/add', methods=['POST'])
def add_bits():
    data = request.get_json()

    course_id = data.get('course_id')
    content = data.get('content')
    media = data.get('media', "")
    content_type = data.get('content_type')

    if not all([course_id, content, content_type]):
        return jsonify({"error": "Missing required fields"}), 400

    bit = Bit(
        course_id=course_id,
        content=content,
        media=media,
        content_type=content_type
    )
    db.session.add(bit)
    msg = "Bit created."

    db.session.commit()

    return jsonify({
        "message": msg,
        "bit_id": bit.id
    })
