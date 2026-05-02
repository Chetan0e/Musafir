import express from "express";
import {
  createStory,
  getAllStories,
  getStoryById,
  getMyStories,
  toggleLike,
  addComment,
  updateStory,
  deleteStory
} from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadStoryImages } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllStories);

// Protected routes - my-stories MUST be before /:id to avoid being shadowed
router.get("/my-stories", protect, getMyStories);
router.get("/:id", getStoryById);
router.post("/", protect, uploadStoryImages.single('image'), createStory);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.put("/:id", protect, uploadStoryImages.single('image'), updateStory);
router.delete("/:id", protect, deleteStory);

export default router;
