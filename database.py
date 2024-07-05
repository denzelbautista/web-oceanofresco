# database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_app(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:mC6:6AjqaC)jm}a>psMLD9I6)fw6@database-1.crikozfwdebe.us-east-1.rds.amazonaws.com:5432/oceanodb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
