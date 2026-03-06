import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plantName: {
      type: String,
      trim: true,
    },
    cropType: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: null,
    },
    linkedChatId: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true,
    },
    lastAssessmentAt: {
      type: Date,
    },
    currentStatus: {
      type: String,
      enum: ["healthy", "at_risk", "diseased", "unknown"],
      default: "unknown",
    },
    riskLevel: {
      type: String,
      enum: ["high", "medium", "low", "none"],
      default: "none",
    },
    latestImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlantImage",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plant", plantSchema);

