@echo off
echo ============================================
echo   HealthPulse - Starting All Services
echo ============================================
echo.

echo [1/4] Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db 2>nul || echo MongoDB Compass se chalu karo"

echo [2/4] Starting Backend (Port 5000)...
start "Backend" cmd /k "cd /d C:\Users\dhruv\Desktop\medical_project\backend && npm run dev"

echo [3/4] Starting ML Service (Port 8000)...
start "ML Service" cmd /k "cd /d C:\Users\dhruv\Desktop\medical_project\ml && .venv\Scripts\activate && python src/api.py"

echo [4/4] Starting Frontend (Port 3000)...
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd /d C:\Users\dhruv\Desktop\medical_project && npm run dev"

echo.
echo ============================================
echo   All services started!
echo   Browser ma open karo: http://localhost:3000
echo ============================================
echo.
pause
