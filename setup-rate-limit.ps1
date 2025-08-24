# PowerShell script to setup improved rate limiting for HypeBridge HRPAY Backend

Write-Host "Setting up improved rate limiting for HypeBridge HRPAY Backend..." -ForegroundColor Green
Write-Host ""

Write-Host "Current rate limiting settings:" -ForegroundColor Yellow
Write-Host "RATE_LIMIT_WINDOW_MS: 900000 (15 minutes)"
Write-Host "RATE_LIMIT_MAX: 1000 (increased from 100)"
Write-Host "RATE_LIMIT_WHITELIST: 127.0.0.1,::1"
Write-Host ""

Write-Host "To apply these settings, you can:" -ForegroundColor Cyan
Write-Host "1. Create a .env file in the backend directory with:"
Write-Host "   RATE_LIMIT_MAX=1000"
Write-Host "   RATE_LIMIT_WINDOW_MS=900000"
Write-Host ""
Write-Host "2. Or set environment variables before starting the server:"
Write-Host "   `$env:RATE_LIMIT_MAX='1000'"
Write-Host "   `$env:RATE_LIMIT_WINDOW_MS='900000'"
Write-Host ""

Write-Host "The new configuration will:" -ForegroundColor Green
Write-Host "- Allow 1000 requests per 15 minutes for general API"
Write-Host "- Allow 2000 requests per 15 minutes for authentication"
Write-Host "- Maintain security while being mobile app friendly"
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
