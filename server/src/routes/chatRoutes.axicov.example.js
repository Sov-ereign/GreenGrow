import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; // Still needed for Flask API calls and fallback
import { 
  chatWithAxicov, 
  analyzeImageWithAxicov, 
  processVoiceCommandWithAxicov, 
  liveVoiceWithAxicov 
} from '../services/axicovService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// General chat endpoint - MIGRATED TO AXICOV
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try Axicov first
    const axicovResult = await chatWithAxicov(message, {
      userContext: req.user || null
    });

    if (axicovResult.success) {
      return res.json({ 
        response: axicovResult.response,
        // Include metadata for monitoring/debugging (optional)
        _metadata: process.env.NODE_ENV === 'development' ? axicovResult.metadata : undefined
      });
    }

    // Fallback to direct Gemini API if Axicov fails or is disabled
    if (axicovResult.fallback || process.env.USE_AXICOV !== 'true') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
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

      return res.json({ response: aiText });
    }

    // If Axicov failed and fallback is disabled
    throw new Error(axicovResult.error || 'Axicov workflow failed');

  } catch (err) {
    console.error('Error in chat message:', err.message);
    
    const errorMessage = err.response?.data?.error?.message || err.message;
    const errorCode = err.response?.status || 500;
    
    res.status(errorCode).json({ 
      error: 'Failed to get AI response',
      details: errorMessage
    });
  }
});

// Image analysis endpoint - MIGRATED TO AXICOV
router.post('/image-analysis', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5001';
    const imagePath = req.file.path;
    
    // Step 1: Get disease detection from Flask (still needed)
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
    }

    // Step 2: Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageMimeType = req.file.mimetype || 'image/jpeg';

    // Step 3: Use Axicov for comprehensive analysis
    const axicovResult = await analyzeImageWithAxicov(
      imageBase64, 
      imageMimeType, 
      diseaseResult
    );

    // Cleanup
    fs.unlinkSync(imagePath);

    if (axicovResult.success) {
      return res.json({ 
        response: axicovResult.response,
        diseaseDetection: axicovResult.diseaseDetection,
        _metadata: process.env.NODE_ENV === 'development' ? axicovResult.metadata : undefined
      });
    }

    // Fallback to direct Gemini API
    if (axicovResult.fallback || process.env.USE_AXICOV !== 'true') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

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

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
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

      return res.json({ 
        response: aiText,
        diseaseDetection: diseaseResult || null
      });
    }

    throw new Error(axicovResult.error || 'Axicov workflow failed');

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error in image analysis:', err.message);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: err.response?.data?.error?.message || err.message 
    });
  }
});

// Voice command endpoint - MIGRATED TO AXICOV
router.post('/voice-command', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ 
        error: 'Command is required',
        response: "I didn't understand your command. Please try again.",
        command: { action: 'info', data: {} }
      });
    }

    const axicovResult = await processVoiceCommandWithAxicov(command);

    if (axicovResult.success) {
      return res.json({
        response: axicovResult.response,
        command: axicovResult.command
      });
    }

    // Fallback logic here if needed...
    // (Similar pattern as above)

    throw new Error(axicovResult.error || 'Axicov workflow failed');

  } catch (err) {
    console.error('Error in voice command:', err.message);
    res.status(500).json({ 
      error: 'Failed to process voice command',
      details: err.message,
      response: "I'm sorry, I couldn't process that command. Please try again.",
      command: { action: 'info', data: {} }
    });
  }
});

// Live voice endpoint - MIGRATED TO AXICOV
router.post('/live-voice', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required',
        response: "I didn't catch that. Could you repeat?"
      });
    }

    // Fetch context data (weather, market, news)
    let weatherData = null;
    let marketData = null;
    let newsData = null;
    
    try {
      // ... (same context fetching logic as original)
      // This can be moved to Axicov workflow later
    } catch (dataErr) {
      console.warn('Error fetching context data:', dataErr.message);
    }

    // Use Axicov for live voice with context
    const axicovResult = await liveVoiceWithAxicov(
      message, 
      conversationHistory,
      {
        weatherData,
        marketData,
        newsData
      }
    );

    if (axicovResult.success) {
      return res.json({ 
        response: axicovResult.response.trim(),
        weatherData: axicovResult.weatherData,
        marketData: axicovResult.marketData
      });
    }

    // Fallback logic...

    throw new Error(axicovResult.error || 'Axicov workflow failed');

  } catch (err) {
    console.error('Error in live voice:', err.message);
    res.status(500).json({ 
      error: 'Failed to process live voice message',
      details: err.message,
      response: "I'm sorry, I encountered an issue. Could you try again?"
    });
  }
});

export default router;

