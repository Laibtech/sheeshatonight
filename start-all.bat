@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
title SheeshaTonight - Full Stack & Mobile Launcher
color 0B
echo =========================================================
echo    👑 SHEESHATONIGHT - LUXURY PLATFORM LAUNCHER
echo =========================================================
echo.

REM 1. Verify MySQL on Port 3307 (XAMPP MariaDB)
echo [1/3] Checking MySQL database on port 3307...
netstat -ano | findstr "LISTENING" | findstr "3307" >nul
if %errorlevel% neq 0 (
    echo [!] Database not running on port 3307. Starting XAMPP MariaDB daemon...
    if exist "D:\xampp\mysql\bin\mysqld.exe" (
        start "MySQL Daemon (Port 3307)" /B "D:\xampp\mysql\bin\mysqld.exe" --defaults-file="D:\xampp\mysql\bin\my.ini" --port=3307 --standalone
        timeout /t 3 /nobreak >nul
        echo [OK] XAMPP MariaDB started successfully on port 3307.
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "MySQL Daemon (Port 3307)" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --port=3307 --standalone
        timeout /t 3 /nobreak >nul
        echo [OK] XAMPP MariaDB started successfully on port 3307.
    ) else (
        echo [!] Warning: Could not find mysqld.exe in D:\xampp or C:\xampp. Please start MySQL manually.
    )
) else (
    echo [OK] Database is active on port 3307.
)
echo.

REM 2. Launch Next.js Web & API Server
echo [2/3] Launching SheeshaTonight Web & API Server (Port 3000)...
start "SheeshaTonight Web (Port 3000)" cmd /k "cd /d "%~dp0sheeshatonight-main" && npm run dev"

REM 3. Launch Expo Mobile App
echo [3/3] Launching SheeshaTonight Mobile App (Expo Metro Port 8081)...
start "SheeshaTonight Mobile App" cmd /k "cd /d "%~dp0mobile" && npx expo start"

echo.
echo =========================================================
echo   🎉 ALL SERVICES STARTED SUCCESSFULLY!
echo.
echo   🌐 Web Storefront & APIs:  http://localhost:3000
echo   📱 Mobile Metro Bundler:   http://localhost:8081
echo   📦 Database:               XAMPP MariaDB localhost:3307 (sheeshatonight-main)
echo =========================================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:3000
