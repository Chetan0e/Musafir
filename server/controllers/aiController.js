import axios from "axios";

// Store user sessions in memory (for production, use Redis or database)
const userSessions = {};

// Helper function to call OpenRouter
const callOpenRouter = async (messages, temperature = 0.7, maxTokens = 500) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const response = await axios.post(
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "google/gemini-2.0-flash-001",
      messages,
      temperature,
      max_tokens: maxTokens
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
        "X-Title": "Musafir Travel Planner"
      }
    }
  );

  return response.data.choices[0].message.content;
};

// @desc    Chat with AI travel guide
// @route   POST /api/ai/chat
// @access  Public (with optional auth for context)
export const chatWithAI = async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "Messages array is required" });
    }

    // Session management
    const sessionId = req.user?.id || req.ip || "anonymous";
    if (!userSessions[sessionId]) {
      userSessions[sessionId] = [];
    }

    // Add new messages to history
    userSessions[sessionId].push(...messages);

    // Keep only last 20 messages to avoid context overflow
    if (userSessions[sessionId].length > 20) {
      userSessions[sessionId] = userSessions[sessionId].slice(-20);
    }

    const systemPrompt = `You are Musafir's AI travel guide — knowledgeable, friendly, and concise. You specialize in Indian travel but know destinations worldwide.

Your capabilities:
- Plan trips and create itineraries
- Suggest destinations based on preferences
- Provide travel tips and advice
- Help optimize travel budgets
- Recommend activities, food, and accommodations
- Modify existing travel plans
- Answer travel-related questions

Rules:
1. Give specific, actionable advice — never vague platitudes
2. You know visa requirements, local customs, safety tips, budget optimization, hidden gems
3. When asked about a specific place, give exact details
4. When asked to modify a trip, acknowledge the request
5. Keep responses under 200 words unless asked for detail
6. Always mention 1 insider tip the user probably doesn't know
7. Include costs in INR for Indian destinations, USD for international

Current Context: ${context?.currentTrip ? `User is viewing trip to ${context.currentTrip.destination}` : "General travel inquiry"}`;

    const aiResponse = await callOpenRouter([
      { role: "system", content: systemPrompt },
      ...userSessions[sessionId]
    ], 0.7, 800);

    // Add AI response to history
    userSessions[sessionId].push({
      role: "assistant",
      content: aiResponse
    });

    // Increment AI usage if user is authenticated (safely)
    if (req.user && typeof req.user.incrementAIUsage === 'function') {
      try {
        await req.user.incrementAIUsage();
      } catch (usageError) {
        console.error("Failed to increment AI usage:", usageError.message);
        // Non-critical error, don't fail the request
      }
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("AI chat error:", error);
    console.error("Error stack:", error.stack);
    
    if (error.response) {
      console.error("API response error:", error.response.data);
      console.error("API response status:", error.response.status);
    }
    
    // Specific error handling
    if (error.message === "OPENROUTER_API_KEY not configured") {
      return res.status(503).json({
        success: false,
        message: "AI service is temporarily unavailable",
        error: "AI_CONFIG_ERROR"
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI is experiencing high traffic. Please try again in a moment.",
        error: "RATE_LIMIT"
      });
    }

    if (error.response?.status === 401) {
      return res.status(503).json({
        success: false,
        message: "AI service configuration error",
        error: "AI_AUTH_ERROR"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "AI is temporarily unavailable. Please try again in a moment.",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Clear chat session
// @route   POST /api/ai/clear
// @access  Public
export const clearSession = async (req, res) => {
  try {
    const sessionId = req.user?.id || req.ip || "anonymous";
    
    if (userSessions[sessionId]) {
      delete userSessions[sessionId];
    }

    res.json({
      success: true,
      message: "Session cleared"
    });
  } catch (error) {
    console.error("Clear session error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get destination suggestions
// @route   GET /api/ai/suggestions
// @access  Public
export const getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // For now, return popular destinations that match
    const popularDestinations = [
      "Goa, India",
      "Manali, India",
      "Rajasthan, India",
      "Kerala, India",
      "Ladakh, India",
      "Bali, Indonesia",
      "Thailand",
      "Maldives",
      "Dubai, UAE",
      "Singapore",
      "Switzerland",
      "Paris, France",
      "Tokyo, Japan",
      "New York, USA",
      "London, UK"
    ];

    const suggestions = popularDestinations
      .filter(dest => dest.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
