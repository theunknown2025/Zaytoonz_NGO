@echo off
echo ============================================
echo    Scrape Master Application Launcher
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo Installing/updating dependencies...
    pip install -r requirements.txt
)

REM Install nest-asyncio if not already installed
pip install nest-asyncio >nul 2>&1

echo.
echo Choose an option:
echo 1. Run Streamlit Web Interface
echo 2. Run FastAPI REST API
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting Streamlit Web Interface...
    python launcher.py streamlit
) else if "%choice%"=="2" (
    echo.
    echo Starting FastAPI REST API...
    python launcher.py api
) else if "%choice%"=="3" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

pause 