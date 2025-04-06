from db import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    professor = db.Column(db.String)
    quote = db.Column(db.Text)
    requirements = db.Column(db.ARRAY(db.String))
    prerequisites = db.Column(db.ARRAY(db.String))
    description = db.Column(db.Text)

    liked = db.Column(db.Float)
    difficulty = db.Column(db.Float)
    practicality = db.Column(db.Float)
    collaborative = db.Column(db.Float)
    rewarding = db.Column(db.Float)
    instruction = db.Column(db.Float)

    content_summary = db.Column(db.Text)
    experience_summary = db.Column(db.Text)