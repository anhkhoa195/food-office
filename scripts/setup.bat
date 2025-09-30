@echo off
echo 🚀 Setting up OfficeFood SaaS Application...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please review and update the configuration.
)

REM Start database only for development
echo 🐘 Starting PostgreSQL database...
docker-compose -f docker-compose.dev.yml up -d postgres pgadmin

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Run database migrations
echo 🗄️ Running database migrations...
call npx prisma db push

REM Seed the database
echo 🌱 Seeding database with sample data...
call npx prisma db seed

cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

cd ..

echo ✅ Setup complete!
echo.
echo 🎉 OfficeFood is ready to use!
echo.
echo To start the application:
echo   Backend:  cd backend ^&^& npm run start:dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo Or use Docker:
echo   docker-compose up -d
echo.
echo Access points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   API Docs: http://localhost:3001/api/docs
echo   PGAdmin:  http://localhost:5050
echo.
echo Development login:
echo   Phone: +1234567890
echo   OTP:   123456

