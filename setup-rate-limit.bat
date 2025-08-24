@echo off
echo Setting up improved rate limiting for HypeBridge HRPAY Backend...
echo.

echo Current rate limiting settings:
echo RATE_LIMIT_WINDOW_MS: 900000 (15 minutes)
echo RATE_LIT_MAX: 1000 (increased from 100)
echo RATE_LIMIT_WHITELIST: 127.0.0.1,::1
echo.

echo To apply these settings, you can:
echo 1. Create a .env file in the backend directory with:
echo    RATE_LIMIT_MAX=1000
echo    RATE_LIMIT_WINDOW_MS=900000
echo.
echo 2. Or set environment variables before starting the server:
echo    set RATE_LIMIT_MAX=1000
echo    set RATE_LIMIT_WINDOW_MS=900000
echo.

echo The new configuration will:
echo - Allow 1000 requests per 15 minutes for general API
echo - Allow 2000 requests per 15 minutes for authentication
echo - Maintain security while being mobile app friendly
echo.

echo Press any key to continue...
pause > nul
