from .courses import courses_bp
from .users import users_bp

def register_routes(app):
    app.register_blueprint(courses_bp)
    app.register_blueprint(users_bp)