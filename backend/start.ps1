Write-Host "Starting SmartDeck AI Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env template..." -ForegroundColor Yellow
    @"
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here

# Application Settings
DEBUG=True
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please edit .env and add your Gemini API key" -ForegroundColor Yellow
    Write-Host "Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "Make sure venv exists: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Start the server
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

python main.py
