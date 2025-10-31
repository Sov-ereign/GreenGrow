#!/bin/bash
echo "Creating virtual environment for GreenGrow backend..."
python3 -m venv venv

echo ""
echo "Virtual environment created!"
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To activate the virtual environment in the future, run:"
echo "  source venv/bin/activate"

