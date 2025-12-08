import os
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import db, User, Exam, Room, Student, Invigilator
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)
app.secret_key = "super-secret-hackathon-key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///exam_seating.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for all origins (development)
CORS(app)

# Initialize Extensions
db.init_app(app)

# --- HELPER: Advanced Allocator ---
def interleave_students_advanced(df):
    """
    Zips students from different subjects.
    """
    subjects = df['Subject'].unique()
    students_by_subject = {sub: df[df['Subject'] == sub].to_dict('records') for sub in subjects}
    
    # Sort by Roll No to ensure order
    for sub in students_by_subject:
        students_by_subject[sub].sort(key=lambda x: str(x['Roll No']))
    
    sorted_students = []
    max_len = max(len(s) for s in students_by_subject.values())
    
    subject_keys = list(students_by_subject.keys())
    for i in range(max_len):
        for sub in subject_keys:
            if i < len(students_by_subject[sub]):
                sorted_students.append(students_by_subject[sub][i])
                
    return sorted_students

# --- API ROUTES ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user and username == 'admin' and password == 'admin123':
        hashed_pw = generate_password_hash(password, method='scrypt')
        new_user = User(username=username, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        user = new_user

    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login successful", "user": username}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = generate_password_hash(password, method='scrypt')
    new_user = User(username=username, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Account created successfully"}), 201

@app.route('/api/exams', methods=['GET'])
def get_exams():
    exams = Exam.query.order_by(Exam.created_at.desc()).all()
    exams_data = []
    for e in exams:
        total_seats = sum(r.capacity for r in e.rooms)
        allocated = len(Student.query.join(Room).filter(Room.exam_id == e.id).all())
        exams_data.append({
            "id": e.id,
            "name": e.name,
            "date": e.date,
            "time": e.time or '09:00',
            "duration": e.duration or 60,
            "total_rooms": len(e.rooms),
            "total_students": allocated,
            "total_capacity": total_seats,
            "utilization": f"{int((allocated/total_seats)*100) if total_seats > 0 else 0}%"
        })
    return jsonify(exams_data)

@app.route('/api/exams/<int:exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"message": "Exam deleted successfully"}), 200

@app.route('/api/exams/<int:exam_id>/reset', methods=['POST'])
def reset_exam_allocations(exam_id):
    """Reset/Flush student allocations for an exam without deleting rooms"""
    exam = Exam.query.get_or_404(exam_id)

    # Delete all students from all rooms of this exam
    for room in exam.rooms:
        Student.query.filter_by(room_id=room.id).delete()

    db.session.commit()
    return jsonify({"message": "All student allocations have been reset"}), 200

@app.route('/api/generate', methods=['POST'])
def generate():
    # 1. Get Form Data
    exam_name = request.form.get('exam_name')
    exam_date = request.form.get('exam_date')
    exam_time = request.form.get('exam_time', '09:00')  # Time slot
    exam_duration = request.form.get('exam_duration', 60)  # Duration in minutes

    import json
    rooms_json = request.form.get('rooms_json')
    file = request.files.get('student_file')

    if not file or not exam_name or not rooms_json:
        return jsonify({"error": "Missing required fields"}), 400

    # 2. Process File & Validation
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        df.columns = [c.strip() for c in df.columns]
        required_cols = {'Name', 'Roll No', 'Subject'}
        if not required_cols.issubset(df.columns):
            return jsonify({"error": f"File must contain columns: {required_cols}"}), 400

        # Duplicate Check
        if df['Roll No'].duplicated().any():
            dupes = df[df['Roll No'].duplicated()]['Roll No'].tolist()
            return jsonify({"error": f"Duplicate Roll Numbers found: {dupes}"}), 400

    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 400

    # 3. Create Exam
    new_exam = Exam(name=exam_name, date=exam_date, time=exam_time, duration=int(exam_duration))
    db.session.add(new_exam)
    db.session.flush()

    # 4. Parse Rooms (JSON)
    rooms_list = json.loads(rooms_json)
    rooms_data = []
    total_capacity = 0
    
    for r in rooms_list:
        rows = int(r['rows'])
        cols = int(r['cols'])
        blocked = r.get('blocked', '') # "1,5,10"
        
        # Calculate effective capacity (Bench System: 2 per desk)
        # Blocked usually means the whole desk (both seats) or specific seats?
        # Let's assume blocked numbers refer to the Seat Numbers (1 to Capacity).
        
        max_seats = rows * cols * 2
        blocked_set = set(map(int, blocked.split(','))) if blocked else set()
        effective_capacity = max_seats - len(blocked_set)
        
        room = Room(
            exam_id=new_exam.id, 
            room_number=r['name'], 
            rows=rows, 
            cols=cols,
            blocked_seats=blocked
        )
        db.session.add(room)
        rooms_data.append({'model': room, 'blocked': blocked_set, 'capacity': max_seats})
        total_capacity += effective_capacity
            
    db.session.flush()

    # 5. Run Algorithm
    sorted_students = interleave_students_advanced(df)
    
    if len(sorted_students) > total_capacity:
        db.session.rollback()
        return jsonify({"error": f"Shortage of {len(sorted_students) - total_capacity} seats! Total Students: {len(sorted_students)}, Available: {total_capacity}"}), 400

    # 6. Allocate Seats
    student_idx = 0
    for r_data in rooms_data:
        room = r_data['model']
        blocked = r_data['blocked']
        max_seats = r_data['capacity']
        
        for seat in range(1, max_seats + 1):
            if student_idx >= len(sorted_students):
                break
            
            if seat in blocked:
                continue
            
            s_data = sorted_students[student_idx]
            new_student = Student(
                room_id=room.id,
                name=s_data['Name'],
                roll_no=str(s_data['Roll No']),
                subject=s_data['Subject'],
                seat_number=seat
            )
            db.session.add(new_student)
            student_idx += 1

    db.session.commit()
    return jsonify({"message": "Seating Plan Generated", "exam_id": new_exam.id}), 201

@app.route('/api/seating/<int:exam_id>', methods=['GET'])
def get_seating(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    
    rooms_data = []
    for room in exam.rooms:
        students_data = []
        for s in room.students:
            students_data.append({
                "name": s.name,
                "roll_no": s.roll_no,
                "subject": s.subject,
                "seat_number": s.seat_number
            })
            
        # Get assigned invigilators
        invigilators = [{
            'id': inv.id,
            'name': inv.name,
            'department': inv.department
        } for inv in room.invigilators]
            
        rooms_data.append({
            "id": room.id,
            "room_number": room.room_number,
            "rows": room.rows,
            "cols": room.cols,
            "capacity": room.capacity,
            "blocked_seats": room.blocked_seats,
            "students": students_data,
            "invigilators": invigilators
        })
        
    return jsonify({
        "exam_name": exam.name,
        "exam_date": exam.date,
        "exam_time": exam.time or '09:00',
        "exam_duration": exam.duration or 60,
        "rooms": rooms_data
    })

@app.route('/api/rooms/<int:room_id>/assign_staff', methods=['POST'])
def assign_staff_to_room(room_id):
    """Assign a staff member to a room"""
    room = Room.query.get_or_404(room_id)
    data = request.json
    staff_id = data.get('staff_id')
    
    if not staff_id:
        return jsonify({'error': 'Staff ID required'}), 400
        
    staff = Invigilator.query.get_or_404(staff_id)
    
    # Check if already assigned to another room
    if staff.room_id and staff.room_id != room_id:
        # Optional: Allow reassignment or block? Let's allow reassignment with a warning or just do it.
        # For now, just reassign.
        pass
        
    staff.room_id = room.id
    db.session.commit()
    
    return jsonify({
        'message': f'Staff {staff.name} assigned to Room {room.room_number}',
        'staff': {
            'id': staff.id,
            'name': staff.name,
            'department': staff.department
        }
    })

@app.route('/api/rooms/<int:room_id>/remove_staff', methods=['POST'])
def remove_staff_from_room(room_id):
    """Remove a staff member from a room"""
    room = Room.query.get_or_404(room_id)
    data = request.json
    staff_id = data.get('staff_id')
    
    if not staff_id:
        return jsonify({'error': 'Staff ID required'}), 400
        
    staff = Invigilator.query.get_or_404(staff_id)
    
    if staff.room_id != room.id:
        return jsonify({'error': 'Staff not assigned to this room'}), 400
        
    staff.room_id = None
    db.session.commit()
    
    return jsonify({'message': f'Staff {staff.name} removed from Room {room.room_number}'})

@app.route('/api/search', methods=['POST'])
def search_student():
    data = request.json
    roll_no = data.get('roll_no', '').strip()
    
    student = Student.query.filter_by(roll_no=roll_no).order_by(Student.id.desc()).first()
    
    if student:
        room = student.room
        exam = room.exam
        row, col = student.get_position(room.cols)
        return jsonify({
            'found': True,
            'name': student.name,
            'roll_no': student.roll_no,
            'exam': exam.name,
            'date': exam.date,
            'room': room.room_number,
            'seat_no': student.seat_number,
            'row': row,
            'col': col
        })
    else:
        return jsonify({'found': False, 'error': "No seating found for this Roll Number."}), 404

# --- REPORTS ---

@app.route('/api/export/door/<int:exam_id>', methods=['GET'])
def export_door_sticker(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    for room in exam.rooms:
        students = sorted(room.students, key=lambda s: s.seat_number)
        if not students: continue
        
        # Big Header
        p.setFont("Helvetica-Bold", 30)
        p.drawCentredString(width/2, height - 100, f"ROOM: {room.room_number}")
        
        p.setFont("Helvetica", 16)
        p.drawCentredString(width/2, height - 140, f"{exam.name} | {exam.date}")
        
        # Roll No Range
        if students:
            start_roll = students[0].roll_no
            end_roll = students[-1].roll_no
            p.setFont("Helvetica-Bold", 20)
            p.drawCentredString(width/2, height - 200, f"Roll Nos: {start_roll} - {end_roll}")
            p.drawCentredString(width/2, height - 230, f"Total Students: {len(students)}")
            
        p.showPage()
        
    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"door_stickers_{exam.name}.pdf", mimetype='application/pdf')

@app.route('/api/export/attendance/<int:exam_id>', methods=['GET'])
def export_attendance(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    elements.append(Paragraph(f"Attendance Sheet: {exam.name}", styles['Title']))
    elements.append(Paragraph(f"Date: {exam.date}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    data = [['Room', 'Seat', 'Roll No', 'Name', 'Subject', 'Signature']]
    
    # Get all students sorted by Room then Seat
    all_students = Student.query.join(Room).filter(Room.exam_id == exam.id).order_by(Room.room_number, Student.seat_number).all()
    
    for s in all_students:
        data.append([s.room.room_number, str(s.seat_number), s.roll_no, s.name, s.subject, ''])
        
    table = Table(data, colWidths=[60, 40, 80, 150, 80, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"attendance_{exam.name}.pdf", mimetype='application/pdf')

@app.route('/api/export/master/<int:exam_id>', methods=['GET'])
def export_master_seating(exam_id):
    """Export Master Seating Plan as Excel"""
    exam = Exam.query.get_or_404(exam_id)

    # Prepare data for Excel
    data = []
    for room in exam.rooms:
        for s in sorted(room.students, key=lambda x: x.seat_number):
            row_num, col_num = s.get_position(room.cols)
            data.append({
                'Room': room.room_number,
                'Seat No': s.seat_number,
                'Row': row_num,
                'Column': col_num,
                'Roll No': s.roll_no,
                'Name': s.name,
                'Subject': s.subject
            })

    df = pd.DataFrame(data)

    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Master Seating Plan', index=False)

        # Add summary sheet
        summary_data = []
        for room in exam.rooms:
            occupied = len(room.students)
            blocked = len(room.blocked_seats.split(',')) if room.blocked_seats else 0
            summary_data.append({
                'Room': room.room_number,
                'Rows': room.rows,
                'Columns': room.cols,
                'Total Capacity': room.capacity,
                'Blocked Seats': blocked,
                'Occupied': occupied,
                'Available': room.capacity - blocked - occupied
            })
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Room Summary', index=False)

    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"master_seating_{exam.name}.xlsx",
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

# --- STAFF/INVIGILATOR API ---

@app.route('/api/staff', methods=['GET'])
def get_staff():
    """Get all staff/invigilators"""
    staff = Invigilator.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'department': s.department,
        'room_id': s.room_id
    } for s in staff])

@app.route('/api/staff', methods=['POST'])
def add_staff():
    """Add new staff member"""
    data = request.json
    if not data.get('name') or not data.get('department'):
        return jsonify({'error': 'Name and department are required'}), 400
    
    new_staff = Invigilator(name=data['name'], department=data['department'])
    db.session.add(new_staff)
    db.session.commit()
    return jsonify({
        'id': new_staff.id,
        'name': new_staff.name,
        'department': new_staff.department,
        'message': 'Staff added successfully'
    }), 201

@app.route('/api/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    """Update staff member"""
    staff = Invigilator.query.get_or_404(staff_id)
    data = request.json
    
    staff.name = data.get('name', staff.name)
    staff.department = data.get('department', staff.department)
    db.session.commit()
    return jsonify({
        'id': staff.id,
        'name': staff.name,
        'department': staff.department,
        'message': 'Staff updated successfully'
    })

@app.route('/api/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    """Delete staff member"""
    staff = Invigilator.query.get_or_404(staff_id)
    db.session.delete(staff)
    db.session.commit()
    return jsonify({'message': 'Staff deleted successfully'})

@app.route('/api/staff/upload', methods=['POST'])
def upload_staff():
    """Bulk upload staff from CSV/Excel"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
            
        # Normalize columns
        df.columns = [c.strip().title() for c in df.columns]
        
        if 'Name' not in df.columns or 'Department' not in df.columns:
            return jsonify({'error': 'File must contain "Name" and "Department" columns'}), 400
            
        count = 0
        for _, row in df.iterrows():
            name = str(row['Name']).strip()
            dept = str(row['Department']).strip()
            
            if name and dept:
                # Optional: Check for duplicates? For now, just add.
                new_staff = Invigilator(name=name, department=dept)
                db.session.add(new_staff)
                count += 1
                
        db.session.commit()
        return jsonify({'message': f'Successfully added {count} staff members'})
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

# --- INIT DB ---
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
