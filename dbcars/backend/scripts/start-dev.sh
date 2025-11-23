#!/bin/bash

# Backend Development Server Startup Script
# This script checks prerequisites and starts the backend development server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

echo "🚀 Starting Backend Development Server..."
echo "📍 Working directory: $BACKEND_DIR"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Creating a basic .env file with default values..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dbcars_db
DB_USER=postgres
DB_PASSWORD=

# Server Configuration
PORT=3001

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-change-in-production
EOF
    echo "✅ Created .env file with default values"
    echo "   Please update it with your actual database credentials!"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Display environment configuration
echo "📋 Environment Configuration:"
echo "   DB_HOST: ${DB_HOST:-localhost}"
echo "   DB_PORT: ${DB_PORT:-5432}"
echo "   DB_NAME: ${DB_NAME:-dbcars_db}"
echo "   DB_USER: ${DB_USER:-postgres}"
echo "   PORT: ${PORT:-3001}"
echo ""

# Check if PostgreSQL is running (optional check)
if command -v pg_isready &> /dev/null; then
    echo "🔍 Checking PostgreSQL connection..."
    if pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  Warning: PostgreSQL may not be running or accessible"
        echo "   Make sure PostgreSQL is started before running the server"
    fi
    echo ""
fi

# Start the development server
echo "🎯 Starting development server with nodemon..."
echo "   Press Ctrl+C to stop"
echo ""
npm run dev

