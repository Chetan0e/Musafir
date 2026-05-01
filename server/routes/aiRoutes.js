import express from "express";
import { chatWithAI, clearSession, getSuggestions } from "../controllers/aiController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", optionalAuth, chatWithAI);
router.post("/clear", clearSession);
router.get("/suggestions", getSuggestions);

export default router;
