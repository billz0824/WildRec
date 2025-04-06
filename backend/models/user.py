from db import db
from models.associations import saved_courses
from models.course import Course 

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, nullable=False)
    major = db.Column(db.String)
    goal_description = db.Column(db.Text)
    past_classes = db.Column(db.ARRAY(db.String))
    top_classes = db.Column(db.ARRAY(db.String))

    liked = db.Column(db.Float)
    difficulty = db.Column(db.Float)
    practicality = db.Column(db.Float)
    collaborative = db.Column(db.Float)
    rewarding = db.Column(db.Float)
    instruction = db.Column(db.Float)

    saved_courses = db.relationship('Course', secondary=saved_courses, backref='saved_by_users')
