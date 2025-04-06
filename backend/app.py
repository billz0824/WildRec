from flask import Flask
from config import Config
from db import db, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    from models import User, Course, Review, Bit  # ensure models are registered
    from routes import register_routes
    register_routes(app)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)




# ------ helper -----

def create_db():
    with app.app_context():
        db.create_all()
        print("✅ All tables created!")


def recreate_db():
    with app.app_context():
        db.drop_all()
        db.create_all()