# ExamHub - Intelligent Exam Logistics Platform

<div align="center">

![ExamHub Banner](frontend/public/aurora-bg.webp)

**"From Chaos to Clarity"**

🚀 *Automating the complex logistics of university examination seating.*

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Pandas](https://img.shields.io/badge/Pandas-Data_Processing-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

</div>

---

## 🎯 The Problem & Solution
University exams often suffer from chaotic seating arrangements, manual errors, and last-minute confusion for students.

**ExamHub** solves this by treating seating as a **data allocation problem**. It uses a dedicated logic engine to map students to available capacities, ensuring zero conflicts and instant retrieval.

---

## ⚙️ The Core Engine

This isn't just a website; it's a logistics tool powered by **Python & Pandas**:

* **Capacity-Based Allocation Algorithm:** Dynamically fills rooms based on defined row/column matrices.
* **Data Processing Pipeline:** Uses `pandas` to ingest massive CSV student lists and clean the data before allocation.
* **Automated Document Generation:** Integrates `ReportLab` to generate printable PDF attendance sheets on the fly.

---

## 🚀 Key Features

### 🎓 For Administrators (The Control Center)
- **⚡ Bulk Data Ingestion:** Upload 1000+ student records instantly via CSV.
- **🏗️ Dynamic Room Configuration:** Define custom layouts (e.g., 5x5, 6x8) for different halls.
- **🧠 One-Click Seating:** Trigger the allocation engine to fill seats automatically.
- **📄 Export Ready:** Generate PDF seating plans and Excel attendance sheets.

### 🔍 For Students (The Experience)
- **📱 Mobile-First Search:** "Where do I sit?" answered in seconds.
- **📍 Visual Seat Locator:** Shows exact Bench Number and Position (Left/Right).
- **🎨 Aurora UI:** A modern, distraction-free interface designed for stress-free checking.

---

## 🛠️ Tech Stack

### Frontend
- **React.js + Vite** - High-performance UI rendering.
- **Aurora Theme (CSS3)** - Custom glassmorphism design system.
- **Axios** - Efficient API communication.

### Backend
- **Flask (Python)** - REST API architecture.
- **Pandas** - High-speed data manipulation and allocation logic.
- **SQLAlchemy** - ORM for robust database management.
- **ReportLab** - Programmatic PDF generation engine.

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the Repository
```bash
git clone [https://github.com/electrifiedchan/exam-hub-seating-system.git](https://github.com/electrifiedchan/exam-hub-seating-system.git)
cd exam-hub-seating-system


### 2. Automated Launch (Windows)

We have included a build script to set up the environment automatically.
Simply run:

```bash
.\start.bat

```

*This script will:*

* Initialize the Python Virtual Environment.
* Install all Data Science dependencies (Pandas, SQLAlchemy).
* Launch the React Frontend and Flask Backend simultaneously.

---

## 🔑 Demo Credentials

> **Admin Portal**
> * **Username:** `admin`
> * **Password:** `admin123`
> 
> 

> **Student Portal**
> * **Access:** Open to all (Search by Roll Number)
> 
> 

---

## 📂 Project Structure

```text
EXAM-HUB/
├── backend/            # The Logic Core
│   ├── app.py          # API Gateway
│   ├── models.py       # Database Schema
│   └── logic/          # Allocation Algorithms
├── frontend/           # The User Interface
│   ├── src/            # React Components
│   └── public/         # Assets
├── resources/          # Sample Datasets
│   ├── dummy_students.csv
│   └── dummy_staff.csv
└── start.bat           # Deployment Script

```

---

<div align="center">

**"Logistics Solved."**

Made with ❤️ by [@electrifiedchan](https://github.com/electrifiedchan)

</div>

```

07-February-2026 · 05:40 PM

```
