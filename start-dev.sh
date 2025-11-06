#!/bin/bash

# Startup script for Verseo SEO Domain Checker
# This script starts both the backend and frontend in development mode

set -e

echo "🚀 Starting Verseo SEO Domain Checker..."
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if Python backend dependencies are installed
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if Node modules are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Node modules not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies ready"
echo ""

# Start backend (Python API)
echo "🐍 Starting Python API server on http://localhost:8000..."
python api_server.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend (React + Vite)
echo "⚛️  Starting React frontend on http://localhost:3000..."
cd frontend
npm run dev --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ Services started successfully!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait

