import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
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

