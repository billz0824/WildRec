from db import db
from datetime import datetime

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    course_number = db.Column(db.String)
    course_name = db.Column(db.String)
    professor = db.Column(db.String)
    year = db.Column(db.Integer)
    term = db.Column(db.String)
    slogan = db.Column(db.String)
    description = db.Column(db.Text)

    liked = db.Column(db.Float)
    difficulty = db.Column(db.Float)
    practicality = db.Column(db.Float)
    collaborative = db.Column(db.Float)
    rewarding = db.Column(db.Float)
    instruction = db.Column(db.Float)

    content_summary = db.Column(db.Text)
    experience_summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)