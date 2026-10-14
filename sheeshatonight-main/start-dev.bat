@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ============================================
echo   Starting SheeshaTonight Platform
echo ============================================
echo.

REM 1. Check if MySQL is running on port 3307
echo [1/3] Checking MySQL database status on port 3307...
netstat -ano | findstr "LISTENING" | findstr "3307" >nul
if %errorlevel% neq 0 (
    echo [!] Database not running on port 3307. Attempting to start XAMPP MariaDB...
    if exist "D:\xampp\mysql\bin\mysqld.exe" (
        start "MySQL Daemon (Port 3307)" /B "D:\xampp\mysql\bin\mysqld.exe" --defaults-file="D:\xampp\mysql\bin\my.ini" --port=3307 --standalone
        timeout /t 3 /nobreak >nul
        echo [✓] XAMPP MariaDB started successfully on port 3307.
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "MySQL Daemon (Port 3307)" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --port=3307 --standalone
        timeout /t 3 /nobreak >nul
        echo [✓] XAMPP MariaDB started successfully on port 3307.
    ) else (
        echo [!] Warning: Could not find mysqld.exe in D:\xampp or C:\xampp. Please start MySQL manually.
    )
) else (
    echo [✓] Database is active on port 3307.
)
echo.

REM 2. Start Full-Stack Next.js Server (Port 3000)
echo [2/3] Starting SheeshaTonight Web & API Server (Port 3000)...
start "SheeshaTonight App (Port 3000)" cmd /k "npm run dev"

REM 3. Optional: Start NestJS Microservice (Port 5000)
echo [3/3] Starting NestJS Backend Service (Port 5000)...
start "SheeshaTonight NestJS (Port 5000)" cmd /k "cd backend && npm run dev"

echo.
echo ============================================
echo   Servers launched successfully!
echo   Main App & API: http://localhost:3000
echo   Database:       XAMPP MariaDB (Port 3307)
echo   NestJS API:     http://localhost:5000
echo   API Docs:       http://localhost:5000/api/docs
echo ============================================
echo.
pause
