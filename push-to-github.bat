@echo off
title SheeshaTonight - Push to GitHub (Laibtech)
color 0A
echo ========================================================
echo   Pushing SheeshaTonight to GitHub
echo   Repository: https://github.com/Laibtech/sheeshatonight
echo ========================================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Pushed successfully to https://github.com/Laibtech/sheeshatonight !
) else (
    echo [ERROR] Push failed. Please check your GitHub login or permissions.
)
echo.
pause
