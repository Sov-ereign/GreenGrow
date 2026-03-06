import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import {
  createChatCompletion,
  getGroqModel,
  getMessageText,
} from "../services/groqClient.js";
import { protect } from "../middleware/authMiddleware.js";
import Plant from "../models/Plant.js";
import PlantImage from "../models/PlantImage.js";
import PlantAssessment from "../models/PlantAssessment.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import Recommendation from "../models/Recommendation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();
const upload = multer({ dest: uploadsDir });

const uploadImageToCloudinary = async (localFilePath, originalFilename) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "greengrow/plants";

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [
      !cloudName ? "CLOUDINARY_CLOUD_NAME" : null,
      !apiKey ? "CLOUDINARY_API_KEY" : null,
      !apiSecret ? "CLOUDINARY_API_SECRET" : null,
    ].filter(Boolean);
    throw new Error(`Cloudinary configuration is missing: ${missing.join(", ")}`);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const formData = new FormData();
  formData.append(
    "file",
    fs.createReadStream(localFilePath),
    originalFilename || path.basename(localFilePath)
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await axios.post(cloudinaryUrl, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
  });

  return {
    secureUrl: response.data?.secure_url,
    publicId: response.data?.public_id,
  };
};

const normalizeSessionTitle = (raw = "") => {
  const cleaned = String(raw)
    .replace(/\s+/g, " ")
    .replace(/^["'`\-\s]+|["'`\-\s]+$/g, "")
    .trim();
  if (!cleaned) return "New chat";
  return cleaned.length > 80 ? `${cleaned.slice(0, 80).trim()}...` : cleaned;
};

const generatePlantName = async (diseaseResult) => {
  const guess =
    diseaseResult?.disease ||
    diseaseResult?.predicted_class ||
    diseaseResult?.crop ||
    "";
  try {
    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content:
            "You see plant disease analysis. Reply with the crop/plant name only (1-2 words). No punctuation.",
        },
        {
          role: "user",
          content: `Detected class: ${guess || "Unknown"}
If you can infer the crop name, answer it. Else respond "Unknown Plant".`,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 10,
    });
    const name = getMessageText(data)?.split("\n")[0]?.trim();
    if (!name) return "Unknown Plant";
    return name;
  } catch (err) {
    return "Unknown Plant";
  }
};

const generateSessionTitle = async ({
  userText = "",
  assistantText = "",
  language = "English",
}) => {
  const fallbackSource = userText || assistantText || "New chat";
  const fallback = normalizeSessionTitle(fallbackSource);

  try {
    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content:
            "Create a short chat title (3-7 words). Return plain text only, no quotes, no punctuation at the end.",
        },
        {
          role: "user",
          content: `Language: ${language}
User message: ${userText}
Assistant response: ${assistantText}
Generate the best chat title now.`,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 24,
    });

    const generated = getMessageText(data) || "";
    return normalizeSessionTitle(generated || fallback);
  } catch (err) {
    return fallback;
  }
};

const languageNameMap = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
};

const resolveLanguageName = (value = "en") => {
  const lower = String(value || "en").toLowerCase();
  return languageNameMap[lower] || value || "English";
};

const translateList = async (items = [], languageName = "English") => {
  if (!items?.length || !languageName || languageName.toLowerCase() === "english") {
    return items;
  }

  try {
    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content: `Translate these short care steps into ${languageName}. Keep each item concise. Return a JSON array of strings only.`,
        },
        { role: "user", content: JSON.stringify(items) },
      ],
      temperature: 0.2,
      max_completion_tokens: 128,
    });
    const text = getMessageText(data) || "";
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map(String);
    }
  } catch (err) {
    console.warn("Translation fallback failed:", err.message);
  }
  return items;
};

const translateText = async (text = "", languageName = "English") => {
  if (!text || languageName.toLowerCase() === "english") return text;
  try {
    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the following text fully into ${languageName}. Preserve markdown and bullets. Respond ONLY with the translated text. If already in ${languageName}, return it unchanged.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.1,
      max_completion_tokens: 800,
    });
    return getMessageText(data) || text;
  } catch (err) {
    console.warn("Translation text fallback failed:", err.message);
    return text;
  }
};

// Test route to verify chat routes are loaded
router.get("/test", (req, res) => {
  res.json({
    message: "Chat routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Translate an entire message list to the selected language (for UI localization of history)
router.post("/translate", async (req, res) => {
  try {
    const { messages = [], language = "en" } = req.body || {};
    const languageName = resolveLanguageName(language);

    if (!messages?.length || !languageName) {
      return res.json({ messages: [] });
    }

    // If already English, return unchanged
    if (languageName.toLowerCase() === "english") {
      return res.json({ messages });
    }

    const textList = messages.map((m) => String(m.text || ""));

    try {
      const data = await createChatCompletion({
        model: getGroqModel("llama-3.1-8b-instant"),
        messages: [
          {
            role: "system",
            content: `Translate each chat message into ${languageName}. Preserve markdown, bullet points, and line breaks. Return ONLY a JSON array of translated strings in the same order.`,
          },
          { role: "user", content: JSON.stringify(textList) },
        ],
        temperature: 0.2,
        max_completion_tokens: 1200,
      });

      let translated = [];
      try {
        translated = JSON.parse(getMessageText(data) || "[]");
      } catch (parseErr) {
        translated = [];
      }

      // Normalize to strings and keep order
      const normalized = (Array.isArray(translated) && translated.length ? translated : textList).map(
        (entry) => {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object") {
            if (typeof entry.text === "string") return entry.text;
            try {
              return JSON.stringify(entry);
            } catch {
              return String(entry);
            }
          }
          return String(entry ?? "");
        }
      );

      const merged = messages.map((msg, idx) => ({
        ...msg,
        text: normalized[idx] || msg.text || "",
      }));

      return res.json({ messages: merged });
    } catch (err) {
      // As a fallback, translate each message individually
      const fallback = [];
      for (const msg of messages) {
        const translatedText = await translateText(msg.text || "", languageName);
        fallback.push({ ...msg, text: translatedText });
      }
      return res.json({ messages: fallback });
    }
  } catch (error) {
    console.error("History translation failed:", error.message);
    res.status(500).json({ error: "Failed to translate messages" });
  }
});

// Helper: map disease + confidence to severity/risk
const deriveSeverityAndRisk = (diseaseResult) => {
  if (!diseaseResult) {
    return { severity: "low", riskLevel: "none", currentStatus: "unknown" };
  }

  const confidence = typeof diseaseResult.confidence === "number"
    ? diseaseResult.confidence
    : 0;
  const isHealthy =
    typeof diseaseResult.is_healthy === "boolean"
      ? diseaseResult.is_healthy
      : (diseaseResult.status || "").toLowerCase() === "healthy";

  if (isHealthy) {
    return {
      severity: "low",
      riskLevel: "low",
      currentStatus: "healthy",
    };
  }

  let severity = "low";
  let riskLevel = "low";

  if (confidence >= 80) {
    severity = "high";
    riskLevel = "high";
  } else if (confidence >= 50) {
    severity = "medium";
    riskLevel = "medium";
  }

  return {
    severity,
    riskLevel,
    currentStatus: "diseased",
  };
};

// Helper: simple crop type inference from disease result
const inferCropTypeFromDisease = (diseaseResult) => {
  if (!diseaseResult) return null;
  const source =
    diseaseResult.disease || diseaseResult.predicted_class || "";
  if (!source) return null;
  const cleaned = String(source).replace(/__/g, "_");
  const parts = cleaned.split("_");
  if (!parts.length) return null;
  const first = parts[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

// Helper: categorize issue based on disease prediction text
const categorizeIssue = (diseasePrediction = "") => {
  const text = String(diseasePrediction).toLowerCase();

  if (
    text.includes("aphid") ||
    text.includes("mite") ||
    text.includes("whitefly") ||
    text.includes("thrip") ||
    text.includes("pest") ||
    text.includes("insect")
  ) {
    return "pest";
  }

  if (
    text.includes("blight") ||
    text.includes("mold") ||
    text.includes("mould") ||
    text.includes("rust") ||
    text.includes("spot") ||
    text.includes("mildew") ||
    text.includes("fung")
  ) {
    return "fungal";
  }

  if (
    text.includes("dry") ||
    text.includes("drought") ||
    text.includes("wilt") ||
    text.includes("moisture") ||
    text.includes("water")
  ) {
    return "water";
  }

  if (
    text.includes("deficiency") ||
    text.includes("nutrient") ||
    text.includes("nitrogen") ||
    text.includes("phosphorus") ||
    text.includes("potassium") ||
    text.includes("magnesium") ||
    text.includes("iron")
  ) {
    return "nutrient";
  }

  return "other";
};

// Helper: determine condition trend compared to previous assessment
const determineConditionTrend = (previousAssessment, currentSeverity) => {
  if (!previousAssessment || !previousAssessment.severity) {
    return "unknown";
  }

  const rank = { low: 1, medium: 2, high: 3 };
  const prevRank = rank[previousAssessment.severity] || 0;
  const currRank = rank[currentSeverity] || 0;

  if (!prevRank || !currRank) return "unknown";
  if (currRank > prevRank) return "worsening";
  if (currRank < prevRank) return "improving";
  return "stable";
};

// Helper: compute dynamic follow-up details
const computeFollowUpPlan = ({
  severity,
  diseasePrediction,
  confidenceScore,
  conditionTrend,
}) => {
  const category = categorizeIssue(diseasePrediction);
  const careActions = [];
  const followUpQuestions = [];
  let monitoringReason = "";

  // Base interval in days, derived from severity
  let days;
  if (severity === "high") days = 2;
  else if (severity === "medium") days = 3;
  else days = 5; // low

  // Category-specific adjustments and actions
  if (category === "pest") {
    monitoringReason = "Possible pest / insect pressure on the plant.";
    careActions.push(
      "Inspect the underside of leaves for aphids or other insects.",
      "Spray with neem oil or an appropriate insecticide following label instructions.",
      "Isolate heavily affected plants if possible to reduce spread."
    );
    followUpQuestions.push(
      "Did you inspect the underside of the leaves for insects?",
      "Did you apply neem oil or another pesticide?",
      "Are you seeing fewer insects after treatment?"
    );
    days = Math.min(days, 3);
  } else if (category === "fungal") {
    monitoringReason = "Possible fungal or leaf-spot type infection.";
    careActions.push(
      "Remove and safely dispose of heavily infected leaves.",
      "Avoid overhead irrigation and reduce excess moisture on leaves.",
      "Apply a suitable fungicide if recommended in your region."
    );
    followUpQuestions.push(
      "Did you remove the most affected leaves?",
      "Did you adjust watering to reduce leaf wetness?",
      "Did you apply any fungicide, and has the spread slowed?"
    );
    days = Math.max(days, 4);
  } else if (category === "water") {
    monitoringReason = "Stress related to soil moisture or watering.";
    careActions.push(
      "Water the plant deeply if the top soil is dry, but avoid waterlogging.",
      "Check that drainage is good and the roots are not sitting in water.",
      "Monitor soil moisture before each watering instead of using a fixed schedule."
    );
    followUpQuestions.push(
      "Did you adjust your watering based on soil moisture?",
      "Is the soil staying evenly moist, not too dry or waterlogged?",
      "Have the leaves perked up after correcting watering?"
    );
    days = Math.max(2, Math.min(days, 4));
  } else if (category === "nutrient") {
    monitoringReason = "Possible nutrient imbalance or deficiency.";
    careActions.push(
      "Check the pattern of leaf yellowing or discoloration (old vs new leaves).",
      "Apply a balanced or crop-specific fertilizer as per recommendation.",
      "Observe new leaf growth for improvement after fertilization."
    );
    followUpQuestions.push(
      "Did you apply the recommended fertilizer?",
      "Is new growth looking healthier than older leaves?",
      "Has the yellowing or discoloration slowed down?"
    );
    days = Math.max(days, 5);
  } else {
    monitoringReason =
      "General plant health monitoring based on current image and symptoms.";
    careActions.push(
      "Continue observing the plant closely for any spread of symptoms.",
      "Keep irrigation, fertilization, and pest management within recommended ranges.",
      "Avoid sudden changes in management unless clearly needed."
    );
    followUpQuestions.push(
      "Have the symptoms spread to new leaves or plants?",
      "Did you change anything in watering, fertilization, or spraying?",
      "Do you notice any new type of symptom compared to today?"
    );
  }

  // Adjust for confidence – low confidence → earlier follow-up
  const numericConfidence =
    typeof confidenceScore === "number" ? confidenceScore : null;
  if (numericConfidence !== null) {
    const pct = numericConfidence > 1 ? numericConfidence : numericConfidence * 100;
    if (pct < 50) {
      days = Math.min(days, 2);
      monitoringReason +=
        " Diagnosis confidence is low, so an earlier follow-up image is recommended.";
      followUpQuestions.push(
        "Can you upload a clearer, closer image of the affected area?"
      );
    }
  }

  // Adjust based on trend
  if (conditionTrend === "worsening") {
    days = Math.max(1, days - 1);
    monitoringReason +=
      " Previous assessments suggest the problem may be worsening, so follow-up is sooner.";
  } else if (conditionTrend === "improving") {
    days = days + 2;
    monitoringReason +=
      " The plant appears to be improving, so the follow-up interval can be slightly longer.";
  }

  // Fallback to 3 days if something went wrong
  if (!Number.isFinite(days) || days <= 0) {
    days = 3;
  }

  const nextCheckDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Final follow-up request
  followUpQuestions.push(
    `Please upload another clear image in about ${days} day(s) so I can reassess the plant.`
  );

  return { careActions, followUpQuestions, monitoringReason, nextCheckDate };
};

// List chat sessions for the current user (for chat history sidebar)
router.get("/sessions", protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .populate("plant")
      .sort({ updatedAt: -1 })
      .lean();

    const sessionIds = sessions.map((s) => s._id);

    const lastMessages = await ChatMessage.aggregate([
      { $match: { session: { $in: sessionIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$session",
          message: { $first: "$message" },
          sender: { $first: "$sender" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]);

    const lastBySession = new Map();
    lastMessages.forEach((entry) => {
      lastBySession.set(String(entry._id), entry);
    });

    const result = sessions.map((session) => {
      const last = lastBySession.get(String(session._id));
      const titleFromSession = session.title || null;
      const titleFromPlant =
        session.plant?.plantName || session.plant?.cropType || null;
      const lastMessageText = last?.message || "";
      const lastMessageAt = last?.createdAt || session.updatedAt || session.createdAt;

      // If no explicit title, fall back to snippet of last message
      const title =
        titleFromSession ||
        titleFromPlant ||
        (lastMessageText
          ? lastMessageText.slice(0, 40) +
            (lastMessageText.length > 40 ? "..." : "")
          : "New chat");

      return {
        id: session._id,
        sessionKey: session.sessionId || String(session._id),
        plantId: session.plant ? session.plant._id || session.plant : null,
        title,
        lastMessage: lastMessageText,
        lastMessageAt,
      };
    });

    res.json({ sessions: result });
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    res.status(500).json({ error: "Failed to load chat sessions" });
  }
});

// Get messages for a specific chat session
router.get("/sessions/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const criteria = [
      { sessionId: id, user: req.user._id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      criteria.push({ _id: id, user: req.user._id });
    }

    const session = await ChatSession.findOne({ $or: criteria }).lean();

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    const messages = await ChatMessage.find({ session: session._id })
      .populate("image", "storagePath cloudinaryPublicId")
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      sender: m.sender,
      message: m.message,
      timestamp: m.createdAt,
      imageUrl: m.image?.storagePath || null,
      imagePublicId: m.image?.cloudinaryPublicId || null,
    }));

    res.json({
      sessionId: session._id,
      sessionKey: session.sessionId,
      plantId: session.plant || null,
      messages: formattedMessages,
    });
  } catch (err) {
    console.error("Error fetching chat session messages:", err);
    res.status(500).json({ error: "Failed to load chat session messages" });
  }
});

// Get or create latest chat session by plant
router.get("/sessions/by-plant/:plantId", protect, async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.plantId,
      user: req.user._id,
    });
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }
    let session = await ChatSession.findOne({
      plant: plant._id,
      user: req.user._id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!session) {
      session = await ChatSession.create({
        plant: plant._id,
        user: req.user._id,
      });
      // ensure linkedChatId set
      plant.linkedChatId = session.sessionId;
      await plant.save();
    } else if (!plant.linkedChatId) {
      plant.linkedChatId = session.sessionId;
      await plant.save();
    }

    res.json({
      sessionId: session._id,
      sessionKey: session.sessionId || String(session._id),
      plantId: plant._id,
    });
  } catch (err) {
    console.error("Error getting session by plant:", err);
    res.status(500).json({ error: "Failed to load/create chat session" });
  }
});

// Get messages by public sessionId (UUID) for routing continuity
router.get("/sessions/key/:sessionKey", protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      sessionId: req.params.sessionKey,
      user: req.user._id,
    }).lean();

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    const messages = await ChatMessage.find({ session: session._id })
      .populate("image", "storagePath cloudinaryPublicId")
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      sender: m.sender,
      message: m.message,
      timestamp: m.createdAt,
      imageUrl: m.image?.storagePath || null,
      imagePublicId: m.image?.cloudinaryPublicId || null,
    }));

    res.json({
      sessionId: session._id,
      sessionKey: session.sessionId,
      plantId: session.plant || null,
      messages: formattedMessages,
    });
  } catch (err) {
    console.error("Error fetching chat session by key:", err);
    res.status(500).json({ error: "Failed to load chat session" });
  }
});

router.patch("/sessions/:id", protect, async (req, res) => {
  try {
    const rawTitle = String(req.body?.title || "").trim();
    if (!rawTitle) {
      return res.status(400).json({ error: "Title is required" });
    }
    const nextTitle = normalizeSessionTitle(rawTitle);

    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    session.title = nextTitle;
    await session.save();

    res.json({
      session: {
        id: session._id,
        title: session.title,
      },
    });
  } catch (err) {
    console.error("Error renaming chat session:", err.message);
    res.status(500).json({ error: "Failed to rename chat session" });
  }
});

router.delete("/sessions/:id", protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    await ChatMessage.deleteMany({ session: session._id });
    await ChatSession.deleteOne({ _id: session._id });

    res.json({ success: true, id: session._id });
  } catch (err) {
    console.error("Error deleting chat session:", err.message);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});

// General chat endpoint (text queries) – now authenticated and session-aware
router.post("/message", protect, async (req, res) => {
  try {
    const { message, plantId, sessionId, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const languageName = resolveLanguageName(language || "en");

    let plant = null;
    if (plantId) {
      plant = await Plant.findOne({
        _id: plantId,
        user: req.user._id,
      });
    }

    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        user: req.user._id,
      });
    }

    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        plant: plant ? plant._id : undefined,
      });
      if (plant && !plant.linkedChatId) {
        plant.linkedChatId = session.sessionId;
        await plant.save();
      }
    }

    await ChatMessage.create({
      session: session._id,
      sender: "user",
      message: message.trim(),
    });

    const prompt =
      `You are an AI farming advisor for GreenGrow. Help farmers with crop cultivation, ` +
      `weather, disease prevention, soil management, and agriculture best practices. ` +
      `Provide helpful, practical advice in a friendly and professional manner. ` +
      `Always respond ONLY in ${languageName} (no English), using simple, farmer-friendly language.`;

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

    // Ensure response is in requested language (translation safety)
    const localizedText = await translateText(aiText, languageName);

    if (!session.title) {
      session.title = await generateSessionTitle({
        userText: message.trim(),
        assistantText: localizedText,
        language: languageName,
      });
      await session.save();
    }

    await ChatMessage.create({
      session: session._id,
      sender: "assistant",
      message: localizedText,
    });

    res.json({
      response: localizedText,
      plantId: plant ? plant._id : null,
      sessionId: session._id,
    });
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

// Chat with image endpoint (disease detection + advice + persistence)
router.post(
  "/image-analysis",
  protect,
  upload.single("image"),
  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const { prompt: userPrompt, language, plantId, sessionId } = req.body;

    // Step 1: Send image to disease detection backend (same as DiseasePrediction.tsx)
    const imagePath = req.file.path;
    const diseaseApiBase =
      process.env.DISEASE_API_URL || "https://render-begins-musharraf.onrender.com";

    let diseaseResult = null;
    try {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(imagePath), req.file.originalname);

      const diseaseResponse = await axios.post(`${diseaseApiBase}/predict`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Normalize response shape to what downstream logic expects
      const body = diseaseResponse.data || {};
      diseaseResult = {
        disease: body.prediction || body.disease || body.predicted_class || "",
        predicted_class: body.predicted_class || body.prediction || body.disease || "",
        confidence: typeof body.confidence === "number" ? body.confidence : undefined,
        is_healthy:
          typeof body.is_healthy === "boolean"
            ? body.is_healthy
            : String(body.prediction || body.disease || body.predicted_class || "")
                .toLowerCase()
                .includes("healthy"),
      };
    } catch (diseaseErr) {
      console.error("Disease API error:", diseaseErr.message);
      // Continue even if detection fails - we'll still respond with general guidance
    }

    // Step 2: Build prompt for Groq (text-only guidance)
    // We ask Groq to return a well-structured Markdown answer so the UI
    // consistently shows the same sections for every image analysis.
    let prompt = `You are an AI farming advisor for GreenGrow. A farmer has uploaded a plant image for analysis.

Your job is to analyse the plant condition and provide clear, practical guidance.
Always answer in simple, farmer-friendly language.

STRICT RESPONSE FORMAT (JSON):
Return a valid JSON object exactly like this:
{
  "chatMessage": "A friendly 3-4 sentence message explaining the detected issue, what it is, and what to watch out for. Use markdown formatting.",
  "careActions": [
    "Short actionable step 1 (one sentence).",
    "Short actionable step 2 (one sentence).",
    "Short actionable step 3 (one sentence)."
  ]
}
Do NOT wrap the JSON in markdown code blocks. Just output raw JSON.`;

    if (diseaseResult) {
      const rawClass =
        diseaseResult.predicted_class ||
        diseaseResult.disease ||
        "";
      const prettyDiseaseName =
        diseaseResult.disease ||
        String(rawClass).replace(/__/g, " ").replace(/_/g, " ");
      const isHealthyFlag =
        diseaseResult.is_healthy === true ||
        String(rawClass).toLowerCase().includes("healthy") ||
        String(diseaseResult.status || "").toLowerCase() === "healthy";

      if (isHealthyFlag) {
        prompt += `

Our separate vision model thinks this plant is **HEALTHY**.

- Crop / context: ${inferCropTypeFromDisease(diseaseResult) || "Not specified"}
- Internal class name: ${rawClass || "unknown"}
- Confidence: ${
          typeof diseaseResult.confidence === "number"
            ? `${diseaseResult.confidence.toFixed(1)}%`
            : "N/A"
        }
- Status: healthy

When you fill the sections above for a healthy plant:
- In **Detected issue**, clearly say there is **no disease detected**, for example: "No disease detected (healthy tomato plant)".
- In **Recommended treatment**, DO NOT recommend any pesticide, fungicide, or contacting an expert.
  Instead, give 2–3 short preventive care tips (watering, spacing, monitoring).
- In **Monitoring and follow-up**, just explain what to watch for in future and when they might need help *only if new symptoms appear*.`;
      } else {
        prompt += `

Our disease detection model identified a likely problem:

- Disease/Condition (internal class name): ${rawClass || "Unknown"}
- Human-friendly disease name you should use in the answer: ${prettyDiseaseName}
- Confidence: ${
          typeof diseaseResult.confidence === "number"
            ? `${diseaseResult.confidence.toFixed(1)}%`
            : "N/A"
        }
- Status: disease suspected

When you generate the JSON:
- In "chatMessage", use the human-friendly name without underscores.`;
      }
    } else {
      prompt +=
        "\n\nNo automated disease detection result was available. Provide general diagnostic steps and safe recommendations.";
    }

    if (userPrompt && typeof userPrompt === "string") {
      prompt += `

Farmer's question or description:
- ${userPrompt}`;
    }

    // Optional language guidance – default to English if not provided
    const languageName = resolveLanguageName(language || "en");

    const messages = [
      {
        role: "system",
        content: `You are an AI farming advisor for GreenGrow.
Respond in a friendly, practical tone using clear, farmer-friendly language.
Always reply in ${languageName}. Keep it concise but actionable.`,
      },
      { role: "user", content: prompt },
    ];

    let aiText =
      "I couldn't analyze the image. Please try again with a clearer photo.";
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

    // Extract structured care actions if Groq returned JSON
    let generatedCareActions = [];
    try {
      const parsed = JSON.parse(aiText);
      if (parsed && typeof parsed === "object") {
        if (parsed.chatMessage) {
          aiText = parsed.chatMessage;
        }
        if (Array.isArray(parsed.careActions)) {
          generatedCareActions = parsed.careActions.filter(Boolean);
        }
      }
    } catch {
      // aiText was plain text; keep as-is
    }

    // Step 3: Persist plant, image, assessment, and chat
    // Resolve or create plant profile
    let plant = null;
    if (plantId) {
      plant = await Plant.findOne({
        _id: plantId,
        user: req.user._id,
      });
    }

    if (!plant) {
      const inferredCropType = inferCropTypeFromDisease(diseaseResult);
      const autoName = await generatePlantName(diseaseResult);

      plant = await Plant.create({
        user: req.user._id,
        plantName: autoName || inferredCropType || "Unknown Plant",
        cropType: inferredCropType || null,
        location: undefined,
      });
    } else {
      if (!plant.plantName || plant.plantName.startsWith("Plant #")) {
        const autoName = await generatePlantName(diseaseResult);
        plant.plantName = autoName || plant.plantName;
      }
      const inferredCropType = inferCropTypeFromDisease(diseaseResult);
      if (inferredCropType && !plant.cropType) {
        plant.cropType = inferredCropType;
      }
    }

    // Look up previous assessment for trend analysis
    const previousAssessment = await PlantAssessment.findOne({
      plant: plant._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    let imageStoragePath = null;
    let imagePublicId = null;
    try {
      const cloudinaryUpload = await uploadImageToCloudinary(
        imagePath,
        req.file.originalname
      );
      if (cloudinaryUpload.secureUrl) {
        imageStoragePath = cloudinaryUpload.secureUrl;
        imagePublicId = cloudinaryUpload.publicId || null;
      }
    } catch (cloudErr) {
      console.warn(
        "Cloudinary upload unavailable, falling back to local uploads:",
        cloudErr.message
      );
    }

    // Fallback: keep image locally and expose it via /uploads.
    if (!imageStoragePath) {
      imageStoragePath = `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        imagePath
      )}`;
    } else if (fs.existsSync(imagePath)) {
      // Local temp upload is no longer needed once Cloudinary upload succeeds.
      fs.unlinkSync(imagePath);
    }

    // Persist image reference in MongoDB using stored image link
    const plantImage = await PlantImage.create({
      plant: plant._id,
      user: req.user._id,
      storagePath: imageStoragePath,
      cloudinaryPublicId: imagePublicId,
    });

    if (!plant.profileImage) {
      plant.profileImage = imageStoragePath;
    }

    const { severity, riskLevel, currentStatus } =
      deriveSeverityAndRisk(diseaseResult);

    const numericConfidence =
      typeof diseaseResult?.confidence === "number"
        ? diseaseResult.confidence
        : undefined;

    const diseasePredictionValue =
      diseaseResult?.disease || diseaseResult?.predicted_class || "";

    const conditionTrend = determineConditionTrend(
      previousAssessment,
      severity
    );

    const followUpPlan = computeFollowUpPlan({
      severity,
      diseasePrediction: diseasePredictionValue,
      confidenceScore: numericConfidence,
      conditionTrend,
    });

    // Translate fallback actions/questions when Groq JSON is missing and language isn't English
    const languageIsEnglish = languageName.toLowerCase() === "english";
    let fallbackCareActions = followUpPlan.careActions;
    let followUpQuestions = followUpPlan.followUpQuestions;
    let monitoringReason = followUpPlan.monitoringReason;

    if (!languageIsEnglish) {
      if (generatedCareActions.length === 0) {
        fallbackCareActions = await translateList(followUpPlan.careActions, languageName);
      }
      if (followUpQuestions?.length) {
        followUpQuestions = await translateList(followUpQuestions, languageName);
      }
      if (monitoringReason) {
        const translatedReason = await translateList([monitoringReason], languageName);
        monitoringReason = translatedReason[0] || monitoringReason;
      }
    }

    // Use generated care actions if available, otherwise translated/computed ones
    const finalCareActions =
      generatedCareActions.length > 0 ? generatedCareActions : fallbackCareActions;

    // Safety translation for aiText when not English and Groq didn't comply
    const localizedAiText = await translateText(aiText, languageName);

    // Build structured chat message for consistent UI rendering
    const diseaseName =
      diseaseResult?.disease ||
      diseasePredictionValue ||
      diseaseResult?.predicted_class ||
      "Not identified";

    const chatMessageText = `**Disease:** ${diseaseName}

**Description:** ${localizedAiText}

**Recommended actions:**
${(finalCareActions && finalCareActions.length
  ? finalCareActions
  : ["Monitor the plant daily for new symptoms. Keep leaves dry, avoid overwatering, and retake a clear photo if the issue worsens."])
  .map((step) => `- ${step}`)
  .join("\n")}`;

    const assessment = await PlantAssessment.create({
      plant: plant._id,
      image: plantImage._id,
      symptomsDetected: [],
      diseasePrediction: diseasePredictionValue,
      confidenceScore: numericConfidence,
      severity,
      recommendations: [aiText],
      careActions: finalCareActions,
      followUpQuestions,
      monitoringReason,
      nextCheckDate: followUpPlan.nextCheckDate,
      conditionTrend,
    });

    // Update plant with latest assessment info
    plant.lastAssessmentAt = assessment.createdAt;
    plant.latestImage = plantImage._id;
    plant.currentStatus = currentStatus;
    plant.riskLevel = riskLevel;
    // ensure linked chat id set below when session determined
    await plant.save();

    // Create open recommendation record
    await Recommendation.create({
      plant: plant._id,
      assessment: assessment._id,
      text: aiText,
      severity,
      status: "open",
    });

    // Resolve or create chat session and messages
    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        user: req.user._id,
      });
    }

    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        plant: plant._id,
      });
    }

    if (!plant.linkedChatId) {
      plant.linkedChatId = session.sessionId;
    }

    const userMessageText =
      typeof userPrompt === "string" && userPrompt.trim().length > 0
        ? userPrompt.trim()
        : "Uploaded a plant image for analysis.";

    if (!session.title) {
      const titleSeed =
        userMessageText ||
        diseasePredictionValue ||
        (diseaseResult?.disease || diseaseResult?.predicted_class || "");
      session.title = await generateSessionTitle({
        userText: titleSeed,
        assistantText: aiText,
        language: languageName,
      });
      await session.save();
    }

    await ChatMessage.create({
      session: session._id,
      sender: "user",
      message: userMessageText,
      image: plantImage._id,
    });

    await ChatMessage.create({
      session: session._id,
      sender: "assistant",
      message: chatMessageText,
    });

    const diseaseDetectionPayload = diseaseResult
      ? { ...diseaseResult, description: localizedAiText }
      : null;

    res.json({
      response: chatMessageText,
      diseaseDetection: diseaseDetectionPayload,
      plantId: plant._id,
      sessionId: session._id,
      imageUrl: plantImage.storagePath,
      imagePublicId: plantImage.cloudinaryPublicId || null,
      assessment,
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

