import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
} from "../controllers/plantController.js";

const router = express.Router();

router.get("/", protect, getPlants);
router.post("/", protect, createPlant);
router.get("/:id", protect, getPlantById);
router.patch("/:id", protect, updatePlant);
router.delete("/:id", protect, deletePlant);

export default router;

