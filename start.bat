@echo off
echo ========================================================
echo Starting Zarah Audio MIR Studio...
echo ========================================================

REM 1. Start Python FastAPI Backend on port 8000
start "Zarah Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM 2. Start Next.js Frontend on port 3000
start "Zarah Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ========================================================
echo Zarah is running!
echo Frontend Studio: http://localhost:3000
echo Backend MIR API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)
echo ========================================================

timeout /t 2 /nobreak >nul
start http://localhost:3000
