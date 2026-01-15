# Script to start Student Management System servers

Write-Host "🚀 Starting Student Management System..." -ForegroundColor Green

# Start PostgreSQL and Backend with Docker Compose
Write-Host "📦 Starting PostgreSQL and Backend..." -ForegroundColor Cyan
cd backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "docker-compose up" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start Backend Dev Server
Write-Host "🔧 Starting Backend Dev Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev" -WindowStyle Normal
Start-Sleep -Seconds 8

# Start Frontend Dev Server
Write-Host "🎨 Starting Frontend Dev Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "✅ Servers should be starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:3001/api" -ForegroundColor Yellow

# Open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:8080"
