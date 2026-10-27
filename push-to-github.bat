@echo off
title SheeshaTonight - Push to GitHub (Laibtech)
color 0A
echo ========================================================
echo   SHEESHATONIGHT - PUSH FULL REPOSITORY TO GITHUB
echo   Repository: https://github.com/Laibtech/sheeshatonight
echo ========================================================
echo.
echo [1] Push using Browser Login (Git Credential Manager)
echo [2] Push using Personal Access Token (PAT)
echo.
set /p choice="Select an option (1 or 2, default is 1): "

if "%choice%"=="2" (
    echo.
    set /p token="Enter your GitHub Personal Access Token: "
    echo.
    echo Pushing with Personal Access Token...
    git push -u https://%token%@github.com/Laibtech/sheeshatonight.git main
) else (
    echo.
    echo Pushing via Git Credential Manager (a browser prompt may appear)...
    git push -u origin main
)

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESS! FULL CODEBASE PUSHED TO GITHUB:
    echo   https://github.com/Laibtech/sheeshatonight
    echo ========================================================
) else (
    echo [ERROR] Push failed. Please check your GitHub login or token permissions.
)
echo.
pause
