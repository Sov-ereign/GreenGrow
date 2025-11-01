// models/Farm.js
import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // 🔗 linking with User model
      required: true,
    },
    totalYield: { type: Number, required: true },   // kg
    revenue: { type: Number, required: true },      // ₹
    farmSize: { type: Number, required: true },     // acres
    daysToHarvest: { type: Number, required: true } // days
  },
  { timestamps: true }
);

export default mongoose.model("Farm", farmSchema);
