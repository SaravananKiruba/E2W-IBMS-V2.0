@echo off
echo 🚀 Starting IBMS Development Environment
echo ========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Install dependencies if not installed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist "backend\vendor" (
    echo 📦 Installing backend dependencies...
    cd backend
    call composer install
    cd ..
)

REM Start backend server in background
echo 🔧 Starting PHP backend server...
cd backend
start /b php -S localhost:8000 -t public
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Display information
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend API: http://localhost:8000/api
echo 📍 Default Login: admin@ibms.local / admin123
echo.
echo Press Ctrl+C to stop the frontend server
echo.

REM Start frontend (this will run in foreground)
call npm run dev
