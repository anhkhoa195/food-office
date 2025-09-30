#!/bin/bash

echo "🚀 Starting OfficeFood Development Environment..."

# Start database
echo "🐘 Starting database..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start backend
echo "🔧 Starting backend..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait a moment
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  API Docs: http://localhost:3001/api/docs"
echo ""
echo "🔑 Development login:"
echo "  Phone: +1234567890"
echo "  OTP:   123456"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

