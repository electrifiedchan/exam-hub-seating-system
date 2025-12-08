@echo off
echo ============================================
echo   ExamHub - Full Setup and Run Script
echo ============================================
echo.

:: 1. Navigate to the correct directory
echo [1/5] Navigating to project directory...
cd /d "D:\yukth\YUKTHIBOY"
if %errorlevel% neq 0 (
    echo ERROR: Could not find directory "D:\yukth\YUKTHIBOY"
    echo Please ensure the project is extracted to this location.
    pause
    exit /b 1
)

:: 2. Check Python
echo [2/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)
echo Python found!

:: 3. Setup Backend
echo [3/5] Setting up Backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python dependencies...
:: Explicitly install all required packages
pip install flask flask-sqlalchemy flask-login flask-cors pandas openpyxl reportlab pypdf2
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)
cd ..
echo Backend setup complete!

:: 4. Setup Frontend
echo [4/5] Setting up Frontend...
cd frontend
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Installing pnpm globally...
call npm install pnpm -g
if %errorlevel% neq 0 (
    echo WARNING: Failed to install pnpm globally. Trying local install...
)

echo Installing Node.js dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    pause
    exit /b 1
)
cd ..
echo Frontend setup complete!

:: 5. Run Application
echo [5/5] Starting Application...
echo.
echo Starting Backend Server...
start "ExamHub Backend" cmd /k "cd /d D:\yukth\YUKTHIBOY\backend && call venv\Scripts\activate && python app.py"

echo Starting Frontend Server...
start "ExamHub Frontend" cmd /k "cd /d D:\yukth\YUKTHIBOY\frontend && pnpm dev"

echo.
echo ============================================
echo   App is running!
echo ============================================
echo.
echo   Backend:  http://127.0.0.1:5000
echo   Frontend: http://localhost:5173
echo.
echo   To stop: Close both terminal windows
echo.

:: Open browser after a short delay
timeout /t 5 /nobreak >nul
start http://localhost:5173

pause
