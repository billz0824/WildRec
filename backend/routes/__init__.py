from .courses import courses_bp
from .users import users_bp
from .bits import bits_bp

def register_routes(app):
    app.register_blueprint(courses_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(bits_bp)