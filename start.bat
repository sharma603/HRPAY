@echo off
echo.
echo ========================================
echo   ScriptQube HRPAY Backend Server
echo ========================================
echo.
echo Starting backend server with nodemon...
echo.
echo Server will be available at:
echo - Backend: http://localhost:4000
echo - API: http://localhost:4000/api
echo - Health: http://localhost:4000/health
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev

pause
