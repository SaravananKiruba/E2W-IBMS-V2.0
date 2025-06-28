#!/bin/bash

echo "🚀 Starting IBMS Development Environment"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if not installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/vendor" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && composer install && cd ..
fi

# Start backend server in background
echo "🔧 Starting PHP backend server..."
cd backend
php -S localhost:8000 -t public &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting Next.js frontend server..."
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000/api"
echo "📍 Default Login: admin@ibms.local / admin123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start frontend (this will run in foreground)
npm run dev

# Cleanup: kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
