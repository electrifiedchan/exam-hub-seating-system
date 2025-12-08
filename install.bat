@echo off
echo ============================================
echo   ExamHub Installation Script
echo ============================================
echo.

:: Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)
echo Python found!

:: Check Node.js
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found!

:: Setup Backend
echo [3/4] Setting up Backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python dependencies...
:: Explicitly install all required packages to ensure they are present
pip install flask flask-sqlalchemy flask-login flask-cors pandas openpyxl reportlab pypdf2
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)
cd ..
echo Backend setup complete!

:: Setup Frontend
echo [4/4] Setting up Frontend...
cd frontend
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

echo.
echo ============================================
echo   Installation Complete!
echo ============================================
echo.
echo Now run 'run_app.bat' to start the app.
echo.
pause
