import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const prompt = `Generate 4 short news headlines about today's mandi market prices in India. Include crop trends, price changes, and government updates. For each headline, provide a title, a time (e.g., "Today", "1h ago"), and an impact ("positive", "negative", or "neutral") based on the headline's sentiment.`;

    const schema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          time: { type: "STRING" },
          impact: { type: "STRING" }
        },
        required: ["title", "time", "impact"]
      }
    };

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const jsonText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) {
      throw new Error("Invalid response structure from generative API");
    }

    const newsData = JSON.parse(jsonText);
    res.json({ news: newsData });

  } catch (err) {
    let errorMessage = err.message;
    if (err.response?.data?.error) {
        errorMessage = err.response.data.error.message;
    } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
    }
    console.error('Error generating news:', errorMessage);
    res.status(500).json({ error: 'Failed to generate news' });
  }
});

export default router;

