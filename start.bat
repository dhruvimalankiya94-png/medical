@echo off
setlocal enabledelayedexpansion
title HealthPulse Launcher

echo ======================================================
echo           HealthPulse - Smart Healthcare System       
echo ======================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Check and install Frontend Dependencies
if not exist "%ROOT_DIR%node_modules\" (
    echo [*] Frontend dependencies not found. Installing now (this happens once)...
    call npm install
)

:: Check and install Backend Dependencies
if not exist "%ROOT_DIR%backend\node_modules\" (
    echo [*] Backend dependencies not found. Installing now (this happens once)...
    cd /d "%ROOT_DIR%backend"
    call npm install
    cd /d "%ROOT_DIR%"
)

:: 1. Start MongoDB
echo [1/4] Checking MongoDB...
start "HealthPulse - MongoDB" cmd /k "echo Attempting to start MongoDB... & mongod --dbpath C:\data\db 2>nul || echo [i] If MongoDB is already running as a Windows Service or Compass, you can ignore this."

:: 2. Start Backend (Port 5001)
echo [2/4] Starting Backend (Port 5001)...
start "HealthPulse - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && npm run dev"

:: 3. Start ML Service (Port 8000)
echo [3/4] Starting ML Service (Port 8000)...
start "HealthPulse - ML Service" cmd /k "cd /d "%ROOT_DIR%ml" && (if exist .venv\Scripts\activate (call .venv\Scripts\activate)) && (python src/api.py || uvicorn src.api:app --host 0.0.0.0 --port 8000)"

:: 4. Start Frontend (Port 3000)
echo [4/4] Starting Frontend (Port 3000)...
timeout /t 3 /nobreak >nul
start "HealthPulse - Frontend" cmd /k "cd /d "%ROOT_DIR%" && npm run dev"

echo.
echo ======================================================
echo   All services launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5001
echo   Swagger:  http://localhost:5001/api/docs
echo   ML API:   http://localhost:8000
echo ======================================================
echo.
pause
