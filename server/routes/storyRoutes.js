import express from "express";
import {
  createStory,
  getAllStories,
  getStoryById,
  getMyStories,
  likeStory,
  addComment,
  updateStory,
  deleteStory
} from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadStoryImages } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllStories);
router.get("/:id", getStoryById);

// Protected routes
router.post("/", protect, uploadStoryImages.single('coverImage'), createStory);
router.get("/my-stories", protect, getMyStories);
router.post("/:id/like", protect, likeStory);
router.post("/:id/comments", protect, addComment);
router.put("/:id", protect, uploadStoryImages.single('coverImage'), updateStory);
router.delete("/:id", protect, deleteStory);

export default router;
