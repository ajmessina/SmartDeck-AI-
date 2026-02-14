# ====================================================================
# SMARTDECK AI - DETENER SISTEMA
# ====================================================================
# Este script detiene todos los procesos de SmartDeck AI
# ====================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SmartDeck AI - Deteniendo Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detener backend por puerto (Más robusto)
$port = 8000
$processId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processId) {
    Write-Host "[Backend] Liberando puerto $port..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force
    Write-Host "[Backend] Puerto liberado" -ForegroundColor Green
}
else {
    # Fallback: buscar por nombre si el puerto no reporta proceso
    $backendProcesses = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*smart-presentation-generator*" }
    if ($backendProcesses) {
        Write-Host "[Backend] Deteniendo por nombre de proceso..." -ForegroundColor Yellow
        $backendProcesses | Stop-Process -Force
        Write-Host "[Backend] Detenido" -ForegroundColor Green
    }
    else {
        Write-Host "[Backend] Puerto 8000 esta libre" -ForegroundColor Gray
    }
}

# Detener frontend (Node/Vite)
$frontendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($frontendProcesses) {
    Write-Host "[Frontend] Deteniendo servidor..." -ForegroundColor Yellow
    $frontendProcesses | Stop-Process -Force
    Write-Host "[Frontend] Detenido" -ForegroundColor Green
}
else {
    Write-Host "[Frontend] No esta corriendo" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema Detenido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
