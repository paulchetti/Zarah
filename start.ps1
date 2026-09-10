Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Zarah Audio MIR Studio..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; & '.\.venv\Scripts\python.exe' -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm.cmd run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "`nZarah is running!" -ForegroundColor Green
Write-Host "Frontend Studio: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend MIR API: http://127.0.0.1:8000" -ForegroundColor Yellow
