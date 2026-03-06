import Plant from "../models/Plant.js";
import PlantImage from "../models/PlantImage.js";
import PlantAssessment from "../models/PlantAssessment.js";
import Recommendation from "../models/Recommendation.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import {
  createChatCompletion,
  getGroqModel,
  getMessageText,
} from "../services/groqClient.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const refreshMonitoringIfStale = async (plant, latestAssessment) => {
  const lastDate =
    latestAssessment?.createdAt || plant.lastAssessmentAt || plant.updatedAt;
  if (!lastDate) return null;
  const stale = Date.now() - new Date(lastDate).getTime() > ONE_DAY_MS;
  if (!stale) return null;

  const prompt = `You are an agronomy monitoring assistant.
Plant: ${plant.plantName || plant.cropType || "Plant"}
Last known issue: ${latestAssessment?.diseasePrediction || "unknown"}
Current risk level: ${plant.riskLevel || "unknown"}
Goal: Provide a short monitoring update and 3 actionable steps if any follow-up is needed.`;

  let advice =
    "Monitoring update unavailable. Please upload a fresh image to continue tracking.";
  try {
    const data = await createChatCompletion({
      model: getGroqModel("llama-3.1-8b-instant"),
      messages: [
        { role: "system", content: "Return concise, farmer-friendly advice." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_completion_tokens: 200,
    });
    advice = getMessageText(data) || advice;
  } catch (err) {
    console.warn("Groq monitoring refresh failed", err.message);
  }

  const assessment = await PlantAssessment.create({
    plant: plant._id,
    diseasePrediction: latestAssessment?.diseasePrediction || "monitoring",
    severity: plant.riskLevel === "high" ? "high" : "low",
    recommendations: [advice],
    conditionTrend: "stable",
    monitoringReason: "Automated 24h refresh",
    nextCheckDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  plant.lastAssessmentAt = assessment.createdAt;
  await plant.save();

  return assessment;
};

// Get all plants for current user with summary info
export const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.user._id })
      .populate("latestImage")
      .sort({ updatedAt: -1 });

    const plantIds = plants.map((p) => p._id);

    const latestAssessments = await PlantAssessment.aggregate([
      { $match: { plant: { $in: plantIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$plant",
          assessmentId: { $first: "$_id" },
          severity: { $first: "$severity" },
          diseasePrediction: { $first: "$diseasePrediction" },
          createdAt: { $first: "$createdAt" },
          recommendations: { $first: "$recommendations" },
          careActions: { $first: "$careActions" },
          nextCheckDate: { $first: "$nextCheckDate" },
          monitoringReason: { $first: "$monitoringReason" },
          conditionTrend: { $first: "$conditionTrend" },
        },
      },
    ]);

    const assessmentByPlant = new Map();
    latestAssessments.forEach((a) => {
      assessmentByPlant.set(String(a._id), a);
    });

    const latestSessions = await ChatSession.aggregate([
      { $match: { plant: { $in: plantIds }, user: req.user._id } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$plant",
          sessionId: { $first: "$_id" },
          sessionKey: { $first: "$sessionId" },
        },
      },
    ]);

    const sessionByPlant = new Map();
    latestSessions.forEach((s) => {
      sessionByPlant.set(String(s._id), { id: s.sessionId, key: s.sessionKey });
    });

    // Auto-refresh monitoring for stale plants
    for (const plant of plants) {
      const latest = assessmentByPlant.get(String(plant._id));
      const refreshed = await refreshMonitoringIfStale(plant, latest);
      if (refreshed) {
        assessmentByPlant.set(String(plant._id), {
          _id: refreshed._id,
          severity: refreshed.severity,
          diseasePrediction: refreshed.diseasePrediction,
          createdAt: refreshed.createdAt,
          recommendations: refreshed.recommendations,
          careActions: refreshed.careActions,
          nextCheckDate: refreshed.nextCheckDate,
          monitoringReason: refreshed.monitoringReason,
          conditionTrend: refreshed.conditionTrend,
        });
      }
    }

    const results = plants.map((plant) => {
      const a = assessmentByPlant.get(String(plant._id));
      return {
        id: plant._id,
        plantName: plant.plantName,
        cropType: plant.cropType,
        location: plant.location,
        currentStatus: plant.currentStatus,
        riskLevel: plant.riskLevel,
        lastAssessmentAt: plant.lastAssessmentAt,
        profileImage: plant.profileImage,
        linkedChatId: plant.linkedChatId,
        latestImage: plant.latestImage
          ? {
              id: plant.latestImage._id,
              storagePath: plant.latestImage.storagePath,
            }
          : null,
        latestAssessment: a
          ? {
              severity: a.severity,
              diseasePrediction: a.diseasePrediction,
              createdAt: a.createdAt,
              recommendation:
                Array.isArray(a.recommendations) &&
                a.recommendations.length > 0
                  ? a.recommendations[0]
                  : null,
              careActions: Array.isArray(a.careActions) ? a.careActions : [],
              nextCheckDate: a.nextCheckDate,
              monitoringReason: a.monitoringReason || null,
              conditionTrend: a.conditionTrend || "unknown",
            }
          : null,
        latestSessionId: sessionByPlant.get(String(plant._id))?.id || null,
        latestSessionKey: sessionByPlant.get(String(plant._id))?.key || null,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching plants:", err);
    res.status(500).json({ error: "Failed to fetch plants" });
  }
};

// Get full plant profile with images and assessments
export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    const images = await PlantImage.find({ plant: plant._id })
      .sort({ createdAt: -1 })
      .lean();

    const assessments = await PlantAssessment.find({ plant: plant._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      plant,
      images,
      assessments,
    });
  } catch (err) {
    console.error("Error fetching plant:", err);
    res.status(500).json({ error: "Failed to fetch plant" });
  }
};

// Create manual plant profile
export const createPlant = async (req, res) => {
  try {
    const { plantName, cropType, location } = req.body;

    const plant = await Plant.create({
      user: req.user._id,
      plantName,
      cropType,
      location,
    });

    res.status(201).json(plant);
  } catch (err) {
    console.error("Error creating plant:", err);
    res.status(500).json({ error: "Failed to create plant" });
  }
};

// Update plant status / risk / metadata
export const updatePlant = async (req, res) => {
  try {
    const { currentStatus, riskLevel, plantName, cropType, location } =
      req.body;

    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    if (plantName !== undefined) plant.plantName = plantName;
    if (cropType !== undefined) plant.cropType = cropType;
    if (location !== undefined) plant.location = location;
    if (currentStatus !== undefined) plant.currentStatus = currentStatus;
    if (riskLevel !== undefined) plant.riskLevel = riskLevel;

    const updated = await plant.save();
    res.json(updated);
  } catch (err) {
    console.error("Error updating plant:", err);
    res.status(500).json({ error: "Failed to update plant" });
  }
};

// Delete plant and all related data (images, assessments, recommendations, chat)
export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    // Find chat sessions linked to plant
    const sessions = await ChatSession.find({
      plant: plant._id,
      user: req.user._id,
    }).lean();
    const sessionIds = sessions.map((s) => s._id);

    // Delete chat messages and sessions
    if (sessionIds.length) {
      await ChatMessage.deleteMany({ session: { $in: sessionIds } });
      await ChatSession.deleteMany({ _id: { $in: sessionIds } });
    }

    // Delete assessments, recommendations, images
    await PlantAssessment.deleteMany({ plant: plant._id });
    await Recommendation.deleteMany({ plant: plant._id });
    await PlantImage.deleteMany({ plant: plant._id });

    // Delete plant itself
    await Plant.deleteOne({ _id: plant._id });

    res.json({ success: true, deletedPlantId: plant._id });
  } catch (err) {
    console.error("Error deleting plant:", err);
    res.status(500).json({ error: "Failed to delete plant" });
  }
};

