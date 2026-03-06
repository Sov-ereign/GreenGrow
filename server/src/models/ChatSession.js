import mongoose from "mongoose";
import { randomUUID } from "crypto";

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatSession", chatSessionSchema);

