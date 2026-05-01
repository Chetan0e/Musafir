import express from "express";
import {
  generateTrip,
  saveTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTrending,
  getUserTripStats,
  modifyTrip
} from "../controllers/tripController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes with optional auth
router.post("/generate", optionalAuth, generateTrip);
router.get("/trending", getTrending);

// Protected routes
router.post("/save", protect, saveTrip);
router.get("/user", protect, getUserTrips);
router.get("/stats", protect, getUserTripStats);
router.get("/:id", optionalAuth, getTripById);
router.put("/:id", protect, updateTrip);
router.delete("/:id", protect, deleteTrip);
router.post("/:id/modify", protect, modifyTrip);

export default router;
