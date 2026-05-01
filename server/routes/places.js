import express from "express";
import {
  identifyPlace,
  searchPlaces,
  getPlaceDetails
} from "../controllers/placeController.js";
import { uploadPlaceImage } from "../middleware/upload.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place identification with image upload
router.post(
  "/identify",
  optionalAuth,
  uploadPlaceImage.single("image"),
  identifyPlace
);

// Search places by query
router.get("/search", searchPlaces);

// Get place details
router.get("/details", getPlaceDetails);

export default router;
