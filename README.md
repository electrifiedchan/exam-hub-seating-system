# ExamHub - Exam Seating Arrangement System

![ExamHub Banner](frontend/public/aurora-bg.webp)

**ExamHub** is a comprehensive exam seating management system designed to streamline the process of organizing exams, managing staff, and facilitating student seat searches. Built with a modern, responsive "Aurora" UI, it offers a premium user experience for both administrators and students.

## 🚀 Features

### 🎓 For Administrators
- **Exam Management**: Create and schedule exams with ease.
- **Room Configuration**: Define room layouts (rows, columns) and capacities.
- **Seating Generation**: Automatically generate seating arrangements based on student lists and room capacities.
- **Staff Management**: Manage invigilators and assign them to rooms.
- **Bulk Upload**: Upload students and staff via CSV for quick data entry.
- **Export**: Download seating plans in PDF or Excel formats.

### 🔍 For Students
- **Instant Search**: Students can find their exam seat by simply entering their Roll Number.
- **Visual Location**: View exact bench number and position (Left/Right).
- **Mobile Friendly**: optimized for access on any device.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS (Aurora Theme)
- **Backend**: Python, Flask, SQLAlchemy
- **Database**: SQLite
- **Tools**: Pandas (Data Processing), ReportLab (PDF Generation)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
- **Python 3.10+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)

## ⚡ Quick Start

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/electrifiedchan/EXAM-HUB.git
    cd EXAM-HUB
    ```

2.  **Run the Application**
    Double-click the `start.bat` file in the root directory.
    
    *Or run manually via terminal:*
    ```bash
    .\start.bat
    ```

    This script will automatically:
    - Create a Python virtual environment and install backend dependencies.
    - Install frontend dependencies.
    - Start both the Backend (Flask) and Frontend (Vite) servers.
    - Open the application in your default browser.

## 🔑 Default Credentials

**Admin Portal**:
- **Username**: `admin`
- **Password**: `admin123`

**Student Portal**:
- No login required. Just enter a valid Roll Number.

## 📂 Project Structure

```
EXAM-HUB/
├── backend/            # Flask Backend
│   ├── app.py          # Main Application Entry
│   ├── models.py       # Database Models
│   ├── requirements.txt
│   └── ...
├── frontend/           # React Frontend
│   ├── src/            # Source Code
│   ├── public/         # Static Assets
│   └── ...
├── resources/          # Sample Data (CSV, PDF)
├── start.bat           # One-click startup script
└── README.md           # Project Documentation
```

## 📝 Sample Data

You can find sample CSV files for testing in the `resources/` folder:
- `dummy_students.csv`: Sample student list.
- `dummy_staff.csv`: Sample staff list.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Developed with ❤️ by the ExamHub Team*
