from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g., "Mid-Term 2024"
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), default='09:00')  # Time slot e.g., "09:00"
    duration = db.Column(db.Integer, default=60)  # Duration in minutes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    rooms = db.relationship('Room', backref='exam', lazy=True, cascade='all, delete-orphan')

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    room_number = db.Column(db.String(50), nullable=False)
    rows = db.Column(db.Integer, nullable=False)
    cols = db.Column(db.Integer, nullable=False)
    blocked_seats = db.Column(db.String(500), default="") # Comma-separated seat numbers
    students = db.relationship('Student', backref='room', lazy=True, cascade='all, delete-orphan')

    @property
    def capacity(self):
        return self.rows * self.cols * 2 # Indian Bench System: 2 students per bench

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    roll_no = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False) # 1 to Capacity

    # Helper to get row/col from seat number
    def get_position(self, room_cols):
        # 0-indexed math
        idx = self.seat_number - 1
        r = idx // room_cols
        c = idx % room_cols
        return r + 1, c + 1

class Invigilator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    # Assignment to room (optional - assigned during auto-assign)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)
    room = db.relationship('Room', backref='invigilators')
