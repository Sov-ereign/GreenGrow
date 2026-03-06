import mongoose from "mongoose";

const plantAssessmentSchema = new mongoose.Schema(
  {
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlantImage",
    },
    symptomsDetected: [
      {
        type: String,
        trim: true,
      },
    ],
    diseasePrediction: {
      type: String,
      trim: true,
    },
    confidenceScore: {
      type: Number,
    },
    severity: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    recommendations: [
      {
        type: String,
        trim: true,
      },
    ],
    // Structured care actions for the farmer to take
    careActions: [
      {
        type: String,
        trim: true,
      },
    ],
    // Structured follow-up questions we want the user to answer later
    followUpQuestions: [
      {
        type: String,
        trim: true,
      },
    ],
    // Why this plant needs monitoring (short explanation)
    monitoringReason: {
      type: String,
      trim: true,
    },
    // When the next follow-up check is recommended
    nextCheckDate: {
      type: Date,
    },
    // Trend of the condition relative to the previous assessment
    conditionTrend: {
      type: String,
      enum: ["improving", "stable", "worsening", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlantAssessment", plantAssessmentSchema);

