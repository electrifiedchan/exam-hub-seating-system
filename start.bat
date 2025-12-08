@echo off
setlocal
title ExamHub Launcher

echo ============================================
echo   ExamHub - Exam Seating System
echo ============================================
echo.

:: 1. Check Prerequisites
echo [1/4] Checking Prerequisites...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed! Please install Python 3.10+
    pause
    exit /b 1
)
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed! Please install Node.js 18+
    pause
    exit /b 1
)

:: 2. Backend Setup
echo [2/4] Checking Backend...
cd backend
if not exist venv (
    echo   - Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo   - Installing dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies.
        pause
        exit /b 1
    )
) else (
    echo   - Backend ready.
)
cd ..

:: 3. Frontend Setup
echo [3/4] Checking Frontend...
cd frontend
if not exist node_modules (
    echo   - Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies.
        pause
        exit /b 1
    )
) else (
    echo   - Frontend ready.
)
cd ..

:: 4. Start Application
echo [4/4] Starting Application...
echo.
echo   Backend:  http://127.0.0.1:5000
echo   Frontend: http://localhost:5173
echo.

:: Start Backend
start "ExamHub Backend" cmd /k "cd backend && call venv\Scripts\activate && python app.py"

:: Start Frontend
start "ExamHub Frontend" cmd /k "cd frontend && npm run dev"

:: Open Browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo   App is running! Close the terminal windows to stop.
echo.
pause
