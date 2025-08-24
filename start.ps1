# ScriptQube HRPAY Backend Server Startup Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ScriptQube HRPAY Backend Server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting backend server with nodemon..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor White
Write-Host "- Backend: http://localhost:4000" -ForegroundColor Blue
Write-Host "- API: http://localhost:4000/api" -ForegroundColor Blue
Write-Host "- Health: http://localhost:4000/health" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
