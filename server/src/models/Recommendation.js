import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlantAssessment",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["open", "completed"],
      default: "open",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recommendation", recommendationSchema);

