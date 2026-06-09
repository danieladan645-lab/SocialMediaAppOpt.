@echo off
echo Starting Brand Audit App...

:: Kill any old Python/Node processes on these ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" 2^>nul') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" 2^>nul') do taskkill /PID %%a /F 2>nul

:: Start backend
start "Brand Audit — Backend" /min "C:\Users\danie\AppData\Local\Programs\Python\Python310\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir "C:\Users\danie\OneDrive\Desktop\App Audit Chain\brand-audit-app\backend"

:: Wait for backend to be ready
timeout /t 4 /nobreak >nul

:: Start frontend
start "Brand Audit — Frontend" cmd /k "cd /d "C:\Users\danie\OneDrive\Desktop\App Audit Chain\brand-audit-app\frontend" && npm run dev"

echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Both servers are starting. Open http://localhost:3000 in your browser.
pause
