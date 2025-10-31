from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Model paths - adjust based on your actual model location
MODEL_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), '../model/disease_model.weights.h5')

# Try to load model - handle both .h5 and .weights.h5 formats
model = None
try:
    # Try loading full model first
    model_path = os.path.join(os.path.dirname(__file__), '../model/disease_model.h5')
    if os.path.exists(model_path):
        model = load_model(model_path)
        print(f"✅ Loaded model from {model_path}")
    elif os.path.exists(MODEL_WEIGHTS_PATH):
        # If only weights exist, you'll need to rebuild the model architecture
        # For now, we'll use a fallback
        print(f"⚠️ Only weights found at {MODEL_WEIGHTS_PATH}. Model architecture needed.")
        model = None
    else:
        print("⚠️ Model file not found. Disease detection will be disabled.")
except Exception as e:
    print(f"⚠️ Error loading model: {e}. Disease detection will be disabled.")
    model = None

CLASS_NAMES = ['Pepper__bell___Bacterial_spot', 'Pepper__bell___healthy', 
               'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
               'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight',
               'Tomato_Leaf_Mold', 'Tomato_Septoria_leaf_spot', 
               'Tomato_Spider_mites_Two_spotted_spider_mite', 'Tomato_Target_Spot',
               'Tomato_Tomato_Yellow_Leaf_Curl_Virus', 'Tomato_Tomato_mosaic_virus',
               'Tomato_healthy']

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'error': 'Model not loaded',
            'status': 'unavailable'
        }), 503
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
    
    try:
        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(temp_path)
        
        # Process image
        img = image.load_img(temp_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0
        
        # Predict
        prediction = model.predict(img_array, verbose=0)
        predicted_index = np.argmax(prediction)
        predicted_class = CLASS_NAMES[predicted_index]
        confidence = float(np.max(prediction) * 100)
        
        # Parse disease information
        disease_name = predicted_class.replace('__', ' ').replace('_', ' ')
        is_healthy = 'healthy' in predicted_class.lower()
        
        # Clean up temp file
        os.remove(temp_path)
        
        return jsonify({
            'disease': disease_name,
            'predicted_class': predicted_class,
            'confidence': round(confidence, 2),
            'status': 'healthy' if is_healthy else 'disease_detected',
            'is_healthy': is_healthy,
            'all_predictions': {
                CLASS_NAMES[i]: float(prediction[0][i] * 100) 
                for i in range(len(CLASS_NAMES))
            }
        })
        
    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    # Run Flask on a different port to avoid clashing with Node server (5000)
    app.run(debug=True, host='127.0.0.1', port=5001)
