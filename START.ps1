# ====================================================================
# SMARTDECK AI - INICIO COMPLETO
# ====================================================================
# Este script inicia tanto el backend como el frontend
# ====================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartDeck AI - Iniciando Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si el backend ya está corriendo
$backendRunning = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*smart-presentation-generator*" }
if ($backendRunning) {
    Write-Host "[Backend] Ya esta corriendo en puerto 8000" -ForegroundColor Yellow
}
else {
    Write-Host "[Backend] Iniciando servidor..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\python.exe main.py"
    Start-Sleep -Seconds 3
    Write-Host "[Backend] Servidor iniciado en http://localhost:8000" -ForegroundColor Green
}

Write-Host ""

# Verificar si el frontend ya está corriendo
$frontendRunning = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($frontendRunning) {
    Write-Host "[Frontend] Ya esta corriendo en puerto 5173" -ForegroundColor Yellow
}
else {
    Write-Host "[Frontend] Iniciando servidor..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
    Start-Sleep -Seconds 3
    Write-Host "[Frontend] Servidor iniciado en http://localhost:5173" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema Iniciado Correctamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Abriendo navegador..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
Write-Host ""
Write-Host "Listo! Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
