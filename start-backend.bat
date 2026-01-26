@echo off
echo =====================================
echo Smart Agriculture Backend Server
echo =====================================
echo.

echo Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)

echo.
echo Starting backend server...
echo MQTT Broker will run on port 1883
echo HTTP API will run on port 5000
echo Socket.io will run on port 5000
echo.

npm start

pause
