#!/bin/bash

# Combined Development Server Startup Script
# This script starts both frontend and backend development servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/dbcars"

echo "🚀 Starting DBLuxCars Development Servers..."
echo "📍 Project root: $PROJECT_ROOT"
echo ""

# Check if directories exist
if [ ! -d "$PROJECT_ROOT/backend" ]; then
    echo "❌ Error: Backend directory not found at $PROJECT_ROOT/backend"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/frontend" ]; then
    echo "❌ Error: Frontend directory not found at $PROJECT_ROOT/frontend"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting Backend Server (Port 3001)..."
cd "$PROJECT_ROOT/backend"
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    echo "Backend logs:"
    cat /tmp/backend.log
    exit 1
fi

# Start frontend server
echo "🎨 Starting Frontend Server (Port 3000)..."
cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 3

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    echo "Frontend logs:"
    cat /tmp/frontend.log
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 Both servers are running!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:3001"
echo "📍 Health Check: http://localhost:3001/api/health"
echo ""
echo "📋 Logs:"
echo "   Backend: tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait

