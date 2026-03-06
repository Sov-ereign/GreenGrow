import Plant from "../models/Plant.js";
import PlantImage from "../models/PlantImage.js";
import PlantAssessment from "../models/PlantAssessment.js";
import Recommendation from "../models/Recommendation.js";

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
              nextCheckDate: a.nextCheckDate,
              monitoringReason: a.monitoringReason || null,
              conditionTrend: a.conditionTrend || "unknown",
            }
          : null,
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

