import express from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test route to verify chat routes are loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes are working!' });
});

// General chat endpoint (text queries)
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Use gemini-1.5-flash for better performance and compatibility
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an AI farming advisor for GreenGrow. Help farmers with crop cultivation, weather, disease prevention, soil management, and agriculture best practices. 
    
User question: ${message}

Provide helpful, practical advice in a friendly and professional manner.`;

    const response = await axios.post(API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "I'm sorry, I couldn't process your question. Please try again.";

    res.json({ response: aiText });
  } catch (err) {
    console.error('Error in chat message:', err.response?.data || err.message);
    console.error('Full error:', err);
    
    // More detailed error response
    const errorMessage = err.response?.data?.error?.message || err.message;
    const errorCode = err.response?.status || 500;
    
    res.status(errorCode).json({ 
      error: 'Failed to get AI response',
      details: errorMessage,
      code: err.response?.data?.error?.code || 'UNKNOWN_ERROR'
    });
  }
});

// Chat with image endpoint (disease detection + advice)
router.post('/image-analysis', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Step 1: Send image to Flask backend for disease detection
    const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5001';
    const imagePath = req.file.path;
    
    let diseaseResult = null;
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath), req.file.originalname);
      
      const flaskResponse = await axios.post(`${flaskUrl}/predict`, formData, {
        headers: formData.getHeaders(),
      });
      
      diseaseResult = flaskResponse.data;
    } catch (flaskErr) {
      console.error('Flask API error:', flaskErr.message);
      // Continue even if Flask fails - we'll still send image to Gemini
    }

    // Step 2: Prepare context for Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Cleanup uploaded file
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageMimeType = req.file.mimetype || 'image/jpeg';

    // Build prompt with disease detection results
    let prompt = `You are an AI farming advisor for GreenGrow. A farmer has uploaded a plant image for analysis.
    
Please analyze this image and provide:
1. Identification of the plant/crop (if visible)
2. Health assessment
3. Disease/pest detection (if any)
4. Specific treatment recommendations
5. Preventive measures for the future
6. Best practices for crop care

`;

    if (diseaseResult) {
      prompt += `Our disease detection model identified:
- Disease/Condition: ${diseaseResult.disease || diseaseResult.predicted_class || 'Unknown'}
- Confidence: ${diseaseResult.confidence ? `${diseaseResult.confidence.toFixed(1)}%` : 'N/A'}
- Status: ${diseaseResult.status || 'Detected'}

`;
    }

    prompt += `Please provide detailed, actionable advice based on the image analysis. Be specific and practical.`;

    // Step 3: Send to Gemini with image
    try {
      // Use gemini-1.5-flash or gemini-pro-vision
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const response = await axios.post(geminiUrl, {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageMimeType,
                data: imageBase64
              }
            }
          ]
        }]
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "I couldn't analyze the image. Please try again with a clearer photo.";

      // Cleanup uploaded file
      fs.unlinkSync(imagePath);

      res.json({ 
        response: aiText,
        diseaseDetection: diseaseResult || null
      });
    } catch (geminiErr) {
      // Cleanup uploaded file
      fs.unlinkSync(imagePath);
      throw geminiErr;
    }

  } catch (err) {
    console.error('Error in image analysis:', err.response?.data || err.message);
    
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: err.response?.data?.error?.message || err.message 
    });
  }
});

export default router;

