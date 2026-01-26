@echo off
REM Startup script for AI Service

echo Activating virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
) else (
    echo [WARNING] Virtual environment not found. Trying global python...
)

echo.
echo Starting AI Service on port 8000...
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
