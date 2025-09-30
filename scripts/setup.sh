#!/bin/bash

# OfficeFood Setup Script
echo "🚀 Setting up OfficeFood SaaS Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please review and update the configuration."
fi

# Start database only for development
echo "🐘 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d postgres pgadmin

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database with sample data..."
npx prisma db seed

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 OfficeFood is ready to use!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && npm run start:dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  API Docs: http://localhost:3001/api/docs"
echo "  PGAdmin:  http://localhost:5050"
echo ""
echo "Development login:"
echo "  Phone: +1234567890"
echo "  OTP:   123456"

