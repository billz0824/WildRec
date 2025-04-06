from db import db
from datetime import datetime

class Bit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    content = db.Column(db.Text)
    media = db.Column(db.String)
    content_type = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)