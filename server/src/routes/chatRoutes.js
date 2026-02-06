import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createChatCompletion,
  getGroqModel,
  getMessageText,
} from "../services/groqClient.js";

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

    const prompt =
      "You are an AI farming advisor for GreenGrow. Help farmers with crop cultivation, " +
      "weather, disease prevention, soil management, and agriculture best practices. " +
      "Provide helpful, practical advice in a friendly and professional manner.";

    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_completion_tokens: 512,
    });

    const aiText =
      getMessageText(data) ||
      "I'm sorry, I couldn't process your question. Please try again.";

    res.json({ response: aiText });
  } catch (err) {
    console.error("Error in chat message:", err.response?.data || err.message);
    console.error("Full error:", err);

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
      // Continue even if Flask fails - we'll still respond with general guidance
    }

    // Step 2: Build prompt for Groq (text-only guidance)
    let prompt = `You are an AI farming advisor for GreenGrow. A farmer has uploaded a plant image for analysis.
Provide practical, step-by-step advice for crop care, disease prevention, and treatment.`;

    if (diseaseResult) {
      prompt += `

Our disease detection model identified:
- Disease/Condition: ${
        diseaseResult.disease || diseaseResult.predicted_class || "Unknown"
      }
- Confidence: ${
        diseaseResult.confidence
          ? `${diseaseResult.confidence.toFixed(1)}%`
          : "N/A"
      }
- Status: ${diseaseResult.status || "Detected"}`;
    } else {
      prompt +=
        "\n\nNo automated disease detection result was available. Provide general diagnostic steps and safe recommendations.";
    }

    const messages = [
      {
        role: "system",
        content:
          "Respond in a friendly, practical tone. Keep it concise but actionable.",
      },
      { role: "user", content: prompt },
    ];

    let aiText = "I couldn't analyze the image. Please try again with a clearer photo.";
    try {
      const data = await createChatCompletion({
        model: getGroqModel("llama-3.1-8b-instant"),
        messages,
        temperature: 0.4,
        max_completion_tokens: 512,
      });
      aiText = getMessageText(data) || aiText;
    } catch (groqErr) {
      console.error("Groq API error:", groqErr.response?.data || groqErr.message);
    }

    // Cleanup uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      response: aiText,
      diseaseDetection: diseaseResult || null,
    });
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

    const responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "voice_command",
        strict: false,
        schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            command: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  enum: [
                    "navigate",
                    "search",
                    "weather",
                    "market",
                    "crops",
                    "chat",
                    "home",
                    "help",
                    "info",
                  ],
                },
                target: { type: "string" },
                query: { type: "string" },
                data: { type: "object" },
              },
              required: ["action"],
            },
          },
          required: ["response", "command"],
        },
      },
    };

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
- User: "Go to weather page" -> {"response": "Opening weather page", "command": {"action": "navigate", "target": "/weather"}}
- User: "Show me market prices" -> {"response": "Opening market prices", "command": {"action": "navigate", "target": "/market"}}
- User: "What's the weather like?" -> {"response": "Let me show you the weather", "command": {"action": "navigate", "target": "/weather"}}
- User: "Tell me about tomatoes" -> {"response": "Let me find information about tomatoes", "command": {"action": "search", "query": "tomatoes"}}
- User: "Open chat" -> {"response": "Opening chat", "command": {"action": "navigate", "target": "/chat"}}
- User: "Take me home" -> {"response": "Going to homepage", "command": {"action": "navigate", "target": "/"}}
- User: "Help me" -> {"response": "Opening help page", "command": {"action": "navigate", "target": "/help"}}

Be conversational and helpful. The response should be what Arav will say to the user.`;

    let groqResponse;
    try {
      groqResponse = await createChatCompletion({
        model: getGroqModel("llama-3.1-8b-instant"),
        messages: [
          { role: "system", content: "Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_completion_tokens: 300,
        response_format: responseFormat,
      });
    } catch (apiErr) {
      console.error("Groq API error:", {
        status: apiErr.response?.status,
        statusText: apiErr.response?.statusText,
        data: apiErr.response?.data,
        message: apiErr.message,
      });
      throw new Error(
        `Groq API error: ${
          apiErr.response?.data?.error?.message || apiErr.message
        }`
      );
    }

    if (!groqResponse || !groqResponse.data) {
      throw new Error("Invalid response from Groq API");
    }

    const aiText =
      getMessageText(groqResponse) || "I understand your request.";

    // Parse the JSON response from Groq
    let parsedResponse;
    try {
      const cleanedText = aiText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse Groq response as JSON:", aiText);
      console.error("Parse error:", parseErr.message);
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

    // Fetch current website data for context
    let weatherData = null;
    let marketData = null;
    let newsData = null;

    try {
      const userLocation = req.headers["x-user-location"] || null;

      const weatherApiKey =
        process.env.WEATHER_API_KEY ||
        process.env.VITE_WEATHER_API_KEY ||
        req.body.weatherApiKey;
      if (weatherApiKey) {
        try {
          const lat = userLocation ? JSON.parse(userLocation).lat : 28.6139;
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

      try {
        const baseUrl = req.protocol + "://" + req.get("host");
        const marketRes = await axios.get(`${baseUrl}/api/mandi/prices`);

        if (marketRes.data && marketRes.data.records) {
          marketData = marketRes.data.records;
        }
      } catch (marketErr) {
        console.warn("Market data fetch failed:", marketErr.message);
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

    // Build context for Groq
    let contextInfo = `You are Arav, an intelligent voice assistant for GreenGrow, a farming website. You're having a LIVE CONVERSATION with a farmer. Be conversational, friendly, and helpful. You have access to real-time data:

`;

    if (weatherData) {
      contextInfo += `CURRENT WEATHER DATA:
`;
      contextInfo += `- Location: ${weatherData.name || "Unknown"}
`;
      contextInfo += `- Temperature: ${weatherData.main?.temp || "N/A"} C
`;
      contextInfo += `- Condition: ${
        weatherData.weather?.[0]?.description || "N/A"
      }
`;
      contextInfo += `- Humidity: ${weatherData.main?.humidity || "N/A"}%
`;
      contextInfo += `- Wind Speed: ${
        weatherData.wind?.speed || "N/A"
      } m/s

`;
    }

    if (marketData && marketData.length > 0) {
      contextInfo += `CURRENT MARKET PRICES (sample):
`;
      marketData.slice(0, 10).forEach((item) => {
        contextInfo += `- ${item.commodity}: INR ${item.modal_price}/quintal (${item.market}, ${item.state})
`;
      });
      contextInfo += `
`;
    }

    if (newsData && newsData.length > 0) {
      contextInfo += `RECENT AGRICULTURE NEWS:
`;
      newsData.forEach((item) => {
        contextInfo += `- ${item.title}
`;
      });
      contextInfo += `
`;
    }

    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "Previous conversation:\n";
      conversationHistory.slice(-6).forEach((msg) => {
        conversationContext += `${msg.role === "user" ? "User" : "Arav"}: ${
          msg.content
        }
`;
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

    let groqResponse;
    try {
      groqResponse = await createChatCompletion({
        model: getGroqModel("llama-3.1-8b-instant"),
        messages: [
          { role: "system", content: "You are a helpful voice assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_completion_tokens: 300,
      });
    } catch (apiErr) {
      console.error("Groq API error:", {
        status: apiErr.response?.status,
        data: apiErr.response?.data,
        message: apiErr.message,
      });
      throw new Error(
        `Groq API error: ${
          apiErr.response?.data?.error?.message || apiErr.message
        }`
      );
    }

    if (!groqResponse || !groqResponse.data) {
      throw new Error("Invalid response from Groq API");
    }

    const aiText =
      getMessageText(groqResponse) ||
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
