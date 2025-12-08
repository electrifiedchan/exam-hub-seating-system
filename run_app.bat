@echo off
echo ============================================
echo   ExamHub - Starting Application
echo ============================================
echo.

:: Check if installed
if not exist backend\venv (
    echo ERROR: App not installed! Run install.bat first.
    pause
    exit /b 1
)

:: Start Backend
echo Starting Backend Server...
start "ExamHub Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && python app.py"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo Starting Frontend Server...
start "ExamHub Frontend" cmd /k "cd /d %~dp0frontend && pnpm dev"

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
echo ============================================

:: Open browser after a short delay
timeout /t 4 /nobreak >nul
start http://localhost:5173

pause
