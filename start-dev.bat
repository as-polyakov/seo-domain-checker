@echo off
REM Startup script for Verseo SEO Domain Checker (Windows)
REM This script starts both the backend and frontend in development mode

echo 🚀 Starting Verseo SEO Domain Checker...
echo.

REM Check if Python virtual environment exists
if not exist "venv\" (
    echo ⚠️  Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Check if Node modules are installed
if not exist "frontend\node_modules\" (
    echo ⚠️  Node modules not found. Installing...
    cd frontend
    call npm install
    cd ..
)

echo ✅ Dependencies ready
echo.

REM Start backend in a new window
echo 🐍 Starting Python API server on http://localhost:8000...
start "Verseo Backend" cmd /k "venv\Scripts\activate.bat && python api_server.py"

REM Wait a bit for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
echo ⚛️  Starting React frontend on http://localhost:3000...
start "Verseo Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✨ Services started successfully!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:8000
echo.
echo Close the command windows to stop the services
echo.

pause

