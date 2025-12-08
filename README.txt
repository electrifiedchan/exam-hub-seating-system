============================================
       ExamHub - Exam Seating System
============================================

QUICK START
-----------
1. Extract the ZIP file to any folder
2. Double-click "install.bat" (first time only)
3. Double-click "run_app.bat" to start

REQUIREMENTS
------------
- Python 3.10+ (https://python.org)
- Node.js 18+  (https://nodejs.org)
- Internet connection (for first-time install)

DEFAULT LOGIN
-------------
Username: admin
Password: admin123

HOW TO USE
----------
1. Login as Admin
2. Click "Create New Exam"
3. Fill exam details (name, date, time)
4. Add rooms (enter room number, rows, columns)
5. Upload student CSV file (columns: Name, Roll No, Subject)
6. Click "Generate Seating Plan"
7. Go to "Staff" tab to manage invigilators (Add/Upload)
8. Assign staff to rooms in the Exam Details view
9. View/export seating arrangement

STAFF MANAGEMENT
----------------
- Add Staff: Manually add staff members with Name and Department.
- Bulk Upload: Upload a CSV file with staff details.
  CSV Format: Name,Department
- Assignment: Assign staff to rooms. The system recommends staff from DIFFERENT departments to avoid conflicts.

ROOM DETAILS & SEARCH
---------------------
- Student List: View a scrollable list of all students in a room.
- Search: Instantly find a student by Name or Roll No.
- Location: See exact Bench Number (e.g., B1) and Position (Left/Right).

STUDENT SEARCH
--------------
Students can search their seat at:
http://localhost:5173/student

No login required - just enter Roll Number.

SAMPLE CSV FORMATS
------------------
1. Students (students.csv):
   Name,Roll No,Subject
   John Smith,CS001,Computer Science
   Jane Doe,ME001,Mechanical

2. Staff (staff.csv):
   Name,Department
   Dr. Alan Grant,Paleontology
   Dr. Ellie Sattler,Paleobotany

TROUBLESHOOTING
---------------
- "Python not found": Install Python and restart
- "pnpm not found": Run install.bat again
- "Server error": Check if backend is running

============================================
