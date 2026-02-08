@echo off
echo ========================================
echo SmartEstate AI Backend Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and add your API keys
    echo.
    pause
    exit /b 1
)

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo.

REM Start the server
echo ========================================
echo Starting AI Backend Server...
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
