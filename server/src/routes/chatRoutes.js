import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test route to verify chat routes are loaded
router.get("/test", (req, res) => {
  res.json({
    message: "Chat routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// General chat endpoint (text queries)
router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Use gemini-2.5-flash for text generation (latest stable model)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an AI farming advisor for GreenGrow. Help farmers with crop cultivation, weather, disease prevention, soil management, and agriculture best practices. 
    
User question: ${message}

Provide helpful, practical advice in a friendly and professional manner.`;

    const response = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process your question. Please try again.";

    res.json({ response: aiText });
  } catch (err) {
    console.error("Error in chat message:", err.response?.data || err.message);
    console.error("Full error:", err);

    // More detailed error response
    const errorMessage = err.response?.data?.error?.message || err.message;
    const errorCode = err.response?.status || 500;

    res.status(errorCode).json({
      error: "Failed to get AI response",
      details: errorMessage,
      code: err.response?.data?.error?.code || "UNKNOWN_ERROR",
    });
  }
});

// Chat with image endpoint (disease detection + advice)
router.post("/image-analysis", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Step 1: Send image to Flask backend for disease detection
    const flaskUrl = process.env.FLASK_API_URL || "http://localhost:5001";
    const imagePath = req.file.path;

    let diseaseResult = null;
    try {
      const formData = new FormData();
      formData.append(
        "file",
        fs.createReadStream(imagePath),
        req.file.originalname
      );

      const flaskResponse = await axios.post(`${flaskUrl}/predict`, formData, {
        headers: formData.getHeaders(),
      });

      diseaseResult = flaskResponse.data;
    } catch (flaskErr) {
      console.error("Flask API error:", flaskErr.message);
      // Continue even if Flask fails - we'll still send image to Gemini
    }

    // Step 2: Prepare context for Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Cleanup uploaded file
      fs.unlinkSync(imagePath);
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const imageMimeType = req.file.mimetype || "image/jpeg";

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
- Disease/Condition: ${
        diseaseResult.disease || diseaseResult.predicted_class || "Unknown"
      }
- Confidence: ${
        diseaseResult.confidence
          ? `${diseaseResult.confidence.toFixed(1)}%`
          : "N/A"
      }
- Status: ${diseaseResult.status || "Detected"}

`;
    }

    prompt += `Please provide detailed, actionable advice based on the image analysis. Be specific and practical.`;

    // Step 3: Send to Gemini with image
    try {
      // Use gemini-2.5-flash for image analysis (supports vision)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(
        geminiUrl,
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: imageMimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't analyze the image. Please try again with a clearer photo.";

      // Cleanup uploaded file
      fs.unlinkSync(imagePath);

      res.json({
        response: aiText,
        diseaseDetection: diseaseResult || null,
      });
    } catch (geminiErr) {
      // Cleanup uploaded file
      fs.unlinkSync(imagePath);
      throw geminiErr;
    }
  } catch (err) {
    console.error(
      "Error in image analysis:",
      err.response?.data || err.message
    );

    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to analyze image",
      details: err.response?.data?.error?.message || err.message,
    });
  }
});

// Voice command endpoint - interprets voice commands and determines actions
router.post("/voice-command", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== "string") {
      return res.status(400).json({
        error: "Command is required",
        response: "I didn't understand your command. Please try again.",
        command: { action: "info", data: {} },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "Gemini API key not configured",
        response:
          "I'm sorry, the voice assistant is not properly configured. Please contact support.",
        command: { action: "info", data: {} },
      });
    }

    // Use gemini-2.5-flash for command interpretation
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are Arav, a voice assistant for GreenGrow, a farming website. The user has given you a voice command. 

Your task is to:
1. Understand what the user wants to do
2. Determine the action needed (navigate, search, get info, etc.)
3. Provide a friendly response

User command: "${command}"

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "response": "A friendly spoken response to the user (what you will say back)",
  "command": {
    "action": "navigate|search|weather|market|crops|chat|home|help|info",
    "target": "page path like '/weather', '/market', '/chat', '/', '/crops', '/help' (only if action is 'navigate')",
    "query": "search term (only if action is 'search')",
    "data": {}
  }
}

Examples:
- User: "Go to weather page" → {"response": "Opening weather page", "command": {"action": "navigate", "target": "/weather"}}
- User: "Show me market prices" → {"response": "Opening market prices", "command": {"action": "navigate", "target": "/market"}}
- User: "What's the weather like?" → {"response": "Let me show you the weather", "command": {"action": "navigate", "target": "/weather"}}
- User: "Tell me about tomatoes" → {"response": "Let me find information about tomatoes", "command": {"action": "search", "query": "tomatoes"}}
- User: "Open chat" → {"response": "Opening chat", "command": {"action": "navigate", "target": "/chat"}}
- User: "Take me home" → {"response": "Going to homepage", "command": {"action": "navigate", "target": "/"}}
- User: "Help me" → {"response": "Opening help page", "command": {"action": "navigate", "target": "/help"}}

Be conversational and helpful. The response should be what Arav will say to the user.`;

    let geminiResponse;
    try {
      geminiResponse = await axios.post(
        API_URL,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (apiErr) {
      console.error("Gemini API error:", {
        status: apiErr.response?.status,
        statusText: apiErr.response?.statusText,
        data: apiErr.response?.data,
        message: apiErr.message,
      });
      throw new Error(
        `Gemini API error: ${
          apiErr.response?.data?.error?.message || apiErr.message
        }`
      );
    }

    if (!geminiResponse || !geminiResponse.data) {
      throw new Error("Invalid response from Gemini API");
    }

    const aiText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I understand your request.";

    // Parse the JSON response from Gemini
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = aiText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", aiText);
      console.error("Parse error:", parseErr.message);
      // Fallback: try to extract basic navigation
      const lowerCommand = command.toLowerCase();
      let action = "info";
      let target = null;
      let fallbackResponse = "I understand your request.";

      if (
        lowerCommand.includes("weather") ||
        lowerCommand.includes("temperature")
      ) {
        action = "navigate";
        target = "/weather";
        fallbackResponse = "Opening weather page";
      } else if (
        lowerCommand.includes("market") ||
        lowerCommand.includes("price")
      ) {
        action = "navigate";
        target = "/market";
        fallbackResponse = "Opening market prices";
      } else if (
        lowerCommand.includes("chat") ||
        lowerCommand.includes("assistant")
      ) {
        action = "navigate";
        target = "/chat";
        fallbackResponse = "Opening chat";
      } else if (
        lowerCommand.includes("home") ||
        lowerCommand.includes("homepage")
      ) {
        action = "navigate";
        target = "/";
        fallbackResponse = "Going to homepage";
      } else if (lowerCommand.includes("crop")) {
        action = "navigate";
        target = "/crops";
        fallbackResponse = "Opening crops information";
      } else if (lowerCommand.includes("help")) {
        action = "navigate";
        target = "/help";
        fallbackResponse = "Opening help page";
      }

      parsedResponse = {
        response: fallbackResponse,
        command: { action, target, query: null, data: {} },
      };
    }

    res.json(parsedResponse);
  } catch (err) {
    console.error("Error in voice command:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
      status: err.response?.status,
    });

    const errorMessage =
      err.response?.data?.error?.message || err.message || "Unknown error";

    res.status(500).json({
      error: "Failed to process voice command",
      details: errorMessage,
      response: "I'm sorry, I couldn't process that command. Please try again.",
      command: { action: "info", data: {} },
    });
  }
});

// Live voice conversation endpoint with access to all website data
router.post("/live-voice", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
        response: "I didn't catch that. Could you repeat?",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "Gemini API key not configured",
        response: "I'm sorry, the voice assistant is not properly configured.",
      });
    }

    // Fetch current website data for context
    let weatherData = null;
    let marketData = null;
    let newsData = null;

    try {
      // Try to get user's location from request (if available)
      const userLocation = req.headers["x-user-location"] || null;

      // Fetch weather data (try to get API key from env or use provided one)
      const weatherApiKey =
        process.env.WEATHER_API_KEY ||
        process.env.VITE_WEATHER_API_KEY ||
        req.body.weatherApiKey;
      if (weatherApiKey) {
        try {
          // Default to a common location or use provided location
          const lat = userLocation ? JSON.parse(userLocation).lat : 28.6139; // Delhi default
          const lon = userLocation ? JSON.parse(userLocation).lon : 77.209;

          const weatherRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
          );
          weatherData = weatherRes.data;
        } catch (weatherErr) {
          console.warn("Weather data fetch failed:", weatherErr.message);
        }
      } else {
        console.warn(
          "Weather API key not available - weather data will not be included"
        );
      }

      // Fetch market data using internal API
      try {
        const baseUrl = req.protocol + "://" + req.get("host");
        const marketRes = await axios.get(`${baseUrl}/api/mandi/prices`);

        if (marketRes.data && marketRes.data.records) {
          marketData = marketRes.data.records;
        }
      } catch (marketErr) {
        console.warn("Market data fetch failed:", marketErr.message);
        // Use fallback data
        marketData = [
          {
            commodity: "Wheat",
            market: "Azadpur Mandi",
            state: "Delhi",
            min_price: "2200",
            max_price: "2350",
            modal_price: "2275",
          },
          {
            commodity: "Rice",
            market: "Delhi Grain Market",
            state: "Delhi",
            min_price: "1850",
            max_price: "2000",
            modal_price: "1925",
          },
          {
            commodity: "Tomato",
            market: "Lasalgaon",
            state: "Maharashtra",
            min_price: "35",
            max_price: "50",
            modal_price: "42",
          },
          {
            commodity: "Onion",
            market: "Lasalgaon",
            state: "Maharashtra",
            min_price: "1800",
            max_price: "2200",
            modal_price: "2000",
          },
        ];
      }

      // Fetch news data
      try {
        const newsRes = await axios.get(
          `https://newsapi.org/v2/everything?q=agriculture+farming&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}&pageSize=5`
        );
        if (newsRes.data.articles) {
          newsData = newsRes.data.articles.slice(0, 5).map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
          }));
        }
      } catch (newsErr) {
        console.warn("News data fetch failed:", newsErr.message);
      }
    } catch (dataErr) {
      console.warn("Error fetching context data:", dataErr.message);
    }

    // Build context for Gemini
    let contextInfo = `You are Arav, an intelligent voice assistant for GreenGrow, a farming website. You're having a LIVE CONVERSATION with a farmer. Be conversational, friendly, and helpful. You have access to real-time data:\n\n`;

    if (weatherData) {
      contextInfo += `CURRENT WEATHER DATA:\n`;
      contextInfo += `- Location: ${weatherData.name || "Unknown"}\n`;
      contextInfo += `- Temperature: ${weatherData.main?.temp || "N/A"}°C\n`;
      contextInfo += `- Condition: ${
        weatherData.weather?.[0]?.description || "N/A"
      }\n`;
      contextInfo += `- Humidity: ${weatherData.main?.humidity || "N/A"}%\n`;
      contextInfo += `- Wind Speed: ${
        weatherData.wind?.speed || "N/A"
      } m/s\n\n`;
    }

    if (marketData && marketData.length > 0) {
      contextInfo += `CURRENT MARKET PRICES (sample):\n`;
      marketData.slice(0, 10).forEach((item) => {
        contextInfo += `- ${item.commodity}: ₹${item.modal_price}/quintal (${item.market}, ${item.state})\n`;
      });
      contextInfo += `\n`;
    }

    if (newsData && newsData.length > 0) {
      contextInfo += `RECENT AGRICULTURE NEWS:\n`;
      newsData.forEach((item) => {
        contextInfo += `- ${item.title}\n`;
      });
      contextInfo += `\n`;
    }

    // Build conversation history
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "Previous conversation:\n";
      conversationHistory.slice(-6).forEach((msg) => {
        conversationContext += `${msg.role === "user" ? "User" : "Arav"}: ${
          msg.content
        }\n`;
      });
      conversationContext += "\n";
    }

    const prompt = `${contextInfo}${conversationContext}Current user message: "${message}"

Respond naturally as if you're talking to them. You can:
- Answer questions about weather, market prices, farming techniques
- Provide advice based on current data
- Have a natural conversation about agriculture
- Be helpful and friendly

Keep your response concise (2-3 sentences max) since this is a voice conversation. Speak naturally as Arav.`;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let geminiResponse;
    try {
      geminiResponse = await axios.post(
        API_URL,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (apiErr) {
      console.error("Gemini API error:", {
        status: apiErr.response?.status,
        data: apiErr.response?.data,
        message: apiErr.message,
      });
      throw new Error(
        `Gemini API error: ${
          apiErr.response?.data?.error?.message || apiErr.message
        }`
      );
    }

    if (!geminiResponse || !geminiResponse.data) {
      throw new Error("Invalid response from Gemini API");
    }

    const aiText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I understand. How can I help you further?";

    res.json({
      response: aiText.trim(),
      weatherData: weatherData
        ? {
            location: weatherData.name,
            temp: weatherData.main?.temp,
            condition: weatherData.weather?.[0]?.description,
          }
        : null,
      marketData: marketData ? marketData.slice(0, 5) : null,
    });
  } catch (err) {
    console.error("Error in live voice:", err);

    const errorMessage =
      err.response?.data?.error?.message || err.message || "Unknown error";

    res.status(500).json({
      error: "Failed to process live voice message",
      details: errorMessage,
      response: "I'm sorry, I encountered an issue. Could you try again?",
    });
  }
});

export default router;
