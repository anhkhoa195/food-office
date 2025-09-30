@echo off
echo 🚀 Starting OfficeFood Development Environment...

REM Start database
echo 🐘 Starting database...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for database
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Start backend
echo 🔧 Starting backend...
start "OfficeFood Backend" cmd /k "cd backend && npm run start:dev"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend...
start "OfficeFood Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ Development environment started!
echo.
echo 🌐 Access the application:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   API Docs: http://localhost:3001/api/docs
echo.
echo 🔑 Development login:
echo   Phone: +1234567890
echo   OTP:   123456

