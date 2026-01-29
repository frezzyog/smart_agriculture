@echo off
REM Startup script for AI Service
SETLOCAL

echo.
echo ========================================
echo  🚀 Starting Smart Ag AI Service
echo ========================================
echo.

set VENV_PATH=""
set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

if exist venv\Scripts\activate.bat (
    set VENV_PATH=venv\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
    set VENV_PATH=.venv\Scripts\activate.bat
)

if not %VENV_PATH% == "" (
    echo [INFO] Activating virtual environment: %VENV_PATH%
    call %VENV_PATH%
) else (
    echo [WARNING] No 'venv' or '.venv' found. Using global python...
)

echo.
echo Starting FastAPI with Uvicorn...
python app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Server failed to start.
    echo.
    pause
)

ENDLOCAL
