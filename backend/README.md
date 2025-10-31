# GreenGrow Backend - Disease Detection API

Flask backend for plant disease detection using TensorFlow.

## Setup

### Windows
1. Create and activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Or use the setup script:
```bash
setup_venv.bat
```

### Linux/Mac
1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Or use the setup script:
```bash
chmod +x setup_venv.sh
./setup_venv.sh
```

## Running the Server

Make sure you're in the virtual environment, then:

```bash
python app.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### Health Check
- `GET /health` - Returns server status and model loading state

### Disease Detection
- `POST /predict` - Upload a plant image for disease detection
  - Content-Type: `multipart/form-data`
  - Field: `file` (image file)
  - Returns: JSON with disease prediction, confidence, and status

## Model Requirements

The model file should be located at:
- `../model/disease_model.h5` (full model) OR
- `../model/disease_model.weights.h5` (weights only - requires model architecture rebuild)

If the model is not found, the API will still run but disease detection will be disabled (images will still be analyzed by Gemini Vision API).

