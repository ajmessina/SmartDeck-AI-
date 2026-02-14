# SmartDeck AI - Toggle Gemini Mode
# Switches between REAL (with API) and MOCK mode

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("real", "mock", "status")]
    [string]$Mode = "status"
)

$envFile = ".env"

function Get-CurrentMode {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match "^GEMINI_API_KEY=AIza" -or $content -match "^GEMINI_API_KEY=[A-Za-z0-9_-]{30,}") {
            return "REAL"
        }
        else {
            return "MOCK"
        }
    }
    return "UNKNOWN"
}

function Show-Status {
    $currentMode = Get-CurrentMode
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  SmartDeck AI - Gemini Configuration Status" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($currentMode -eq "REAL") {
        Write-Host "  Current Mode: " -NoNewline
        Write-Host "REAL (Gemini AI Enabled)" -ForegroundColor Green
        Write-Host "  API Key: " -NoNewline
        Write-Host "Configured" -ForegroundColor Green
        Write-Host ""
        Write-Host "  The system will use Gemini AI to analyze your data." -ForegroundColor Gray
    }
    elseif ($currentMode -eq "MOCK") {
        Write-Host "  Current Mode: " -NoNewline
        Write-Host "MOCK (Demo Mode)" -ForegroundColor Yellow
        Write-Host "  API Key: " -NoNewline
        Write-Host "Not configured" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  The system will use sample data for demonstrations." -ForegroundColor Gray
    }
    else {
        Write-Host "  Current Mode: " -NoNewline
        Write-Host "UNKNOWN" -ForegroundColor Red
        Write-Host "  .env file not found or invalid" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Set-MockMode {
    Write-Host ""
    Write-Host "Switching to MOCK mode..." -ForegroundColor Yellow
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        # Comment out any GEMINI_API_KEY line
        $content = $content -replace "^GEMINI_API_KEY=", "# GEMINI_API_KEY="
        $content | Set-Content $envFile -NoNewline
        
        Write-Host "Done! Switched to MOCK mode." -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Restart the backend for changes to take effect:" -ForegroundColor Cyan
        Write-Host "  1. Stop the current backend (Ctrl+C)" -ForegroundColor Gray
        Write-Host "  2. Run: .\venv\Scripts\python.exe main.py" -ForegroundColor Gray
    }
    else {
        Write-Host "Error: .env file not found!" -ForegroundColor Red
    }
    Write-Host ""
}

function Set-RealMode {
    Write-Host ""
    Write-Host "Switching to REAL mode..." -ForegroundColor Green
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        # Uncomment GEMINI_API_KEY line
        $content = $content -replace "^# GEMINI_API_KEY=", "GEMINI_API_KEY="
        $content | Set-Content $envFile -NoNewline
        
        # Check if API key is actually set
        if ($content -match "^GEMINI_API_KEY=AIza" -or $content -match "^GEMINI_API_KEY=[A-Za-z0-9_-]{30,}") {
            Write-Host "Done! Switched to REAL mode." -ForegroundColor Green
            Write-Host ""
            Write-Host "IMPORTANT: Restart the backend for changes to take effect:" -ForegroundColor Cyan
            Write-Host "  1. Stop the current backend (Ctrl+C)" -ForegroundColor Gray
            Write-Host "  2. Run: .\venv\Scripts\python.exe main.py" -ForegroundColor Gray
        }
        else {
            Write-Host "Warning: API key not found or invalid!" -ForegroundColor Yellow
            Write-Host "Please edit .env and add your Gemini API key:" -ForegroundColor Yellow
            Write-Host "  GEMINI_API_KEY=AIzaSy...your_key_here" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "Error: .env file not found!" -ForegroundColor Red
    }
    Write-Host ""
}

# Main logic
switch ($Mode) {
    "status" {
        Show-Status
    }
    "mock" {
        Set-MockMode
        Show-Status
    }
    "real" {
        Set-RealMode
        Show-Status
    }
}
