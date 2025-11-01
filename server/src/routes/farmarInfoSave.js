import express from "express";
import Farm from "../models/Farm.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create farm info (linked to logged-in user)
router.post("/", protect, async (req, res) => {
  try {
    const { totalYield, revenue, farmSize, daysToHarvest } = req.body;

    const farm = new Farm({
      user: req.user.id,   // 🔗 link with logged-in user
      totalYield,
      revenue,
      farmSize,
      daysToHarvest,
    });

    const savedFarm = await farm.save();
    res.status(201).json(savedFarm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get all farms for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user.id });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get single farm by ID (only if belongs to user)
router.get("/:id", protect, async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, user: req.user.id });
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.json(farm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update farm info
router.put("/:id", protect, async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.json(farm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Delete farm info
router.delete("/:id", protect, async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.json({ message: "Farm deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
