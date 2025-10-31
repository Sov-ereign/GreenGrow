@echo off
echo Creating virtual environment for GreenGrow backend...
python -m venv venv
echo.
echo Virtual environment created!
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
echo.
echo Setup complete!
echo.
echo To activate the virtual environment in the future, run:
echo   venv\Scripts\activate
echo.
pause

