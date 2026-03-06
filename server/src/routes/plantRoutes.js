import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
} from "../controllers/plantController.js";

const router = express.Router();

router.get("/", protect, getPlants);
router.post("/", protect, createPlant);
router.get("/:id", protect, getPlantById);
router.patch("/:id", protect, updatePlant);

export default router;

