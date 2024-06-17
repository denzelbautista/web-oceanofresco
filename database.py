# database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_app(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:)4.kCN<{t3gZ}eSwHbuF~%zoRdnu@database-1.crikozfwdebe.us-east-1.rds.amazonaws.com:5432/oceanodb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
