import axios from "axios";
import fs from "fs";
import path from "path";

// Helper function to call OpenRouter with vision
const callVisionAI = async (base64Image) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const systemPrompt = `You are an expert travel and landmark identification system. Analyze images of travel destinations, landmarks, monuments, or places and provide detailed information in JSON format.`;

  const userPrompt = `Analyze this travel/landmark image and respond ONLY in valid JSON:
{
  "identified": true,
  "placeName": "exact place name",
  "localName": "name in local language if applicable",
  "location": { "city": "", "state": "", "country": "", "continent": "" },
  "confidence": 92,
  "placeType": "temple/museum/beach/mountain/street/monument/etc",
  "overview": "2-3 sentence description",
  "historicalSignificance": "historical background",
  "whyVisit": "why tourists love this place",
  "bestTimeToVisit": "months/season",
  "entryFee": "free / ₹500 / etc",
  "openingHours": "6 AM - 8 PM or 24/7",
  "howToReach": "transportation options from nearest city",
  "insiderTips": ["tip1", "tip2", "tip3"],
  "nearbyAttractions": ["place1", "place2"],
  "photographySpots": "best angles/spots for photos",
  "localCuisine": ["dish1", "dish2"],
  "estimatedVisitDuration": "2-3 hours",
  "crowdLevel": "low/medium/high",
  "accessibilityInfo": "wheelchair accessible / challenging terrain / etc"
}

If place cannot be identified, return {"identified": false, "message": "Could not identify this location. Try a clearer image."}`;

  const response = await axios.post(
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
        "X-Title": "Musafir Place Scanner"
      }
    }
  );

  return response.data.choices[0].message.content;
};

// @desc    Identify place from image
// @route   POST /api/places/identify
// @access  Public
export const identifyPlace = async (req, res) => {
  let uploadedFilePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image"
      });
    }

    uploadedFilePath = req.file.path;

    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(uploadedFilePath);
    const base64Image = imageBuffer.toString("base64");

    // Call vision AI
    const aiResponse = await callVisionAI(base64Image);

    // Delete uploaded file after processing
    try {
      fs.unlinkSync(uploadedFilePath);
    } catch (unlinkError) {
      console.error("Failed to delete uploaded file:", unlinkError);
    }

    // Parse JSON from response
    let placeData;
    try {
      // Extract JSON if wrapped in markdown code blocks
      let jsonStr = aiResponse;
      const codeBlockMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      placeData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("AI response:", aiResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
        error: "JSON_PARSE_ERROR"
      });
    }

    // If user is authenticated, increment AI usage
    if (req.user) {
      await req.user.incrementAIUsage();
    }

    res.json({
      success: true,
      data: placeData
    });

  } catch (error) {
    console.error("Identify place error:", error);

    // Clean up uploaded file on error
    if (uploadedFilePath) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (unlinkError) {
        // Ignore unlink errors
      }
    }

    // Specific error handling
    if (error.message === "OPENROUTER_API_KEY not configured") {
      return res.status(503).json({
        success: false,
        message: "AI vision service temporarily unavailable",
        error: "AI_CONFIG_ERROR"
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please try again in a moment.",
        error: "RATE_LIMIT"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to identify place. Please try again.",
      error: error.message
    });
  }
};

// @desc    Search places by query
// @route   GET /api/places/search
// @access  Public
export const searchPlaces = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query (at least 2 characters)"
      });
    }

    // Use Nominatim for geocoding/search
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
      {
        headers: {
          "User-Agent": "Musafir/2.0"
        }
      }
    );

    const places = response.data.map(place => ({
      name: place.display_name.split(",")[0],
      fullName: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      type: place.type,
      importance: place.importance
    }));

    res.json({
      success: true,
      data: places
    });
  } catch (error) {
    console.error("Search places error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search places",
      error: error.message
    });
  }
};

// @desc    Get place details
// @route   GET /api/places/:id/details
// @access  Public
export const getPlaceDetails = async (req, res) => {
  try {
    const { name, lat, lng } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide place name"
      });
    }

    // In a real implementation, you might fetch from a places API
    // For now, return basic info structure
    res.json({
      success: true,
      data: {
        name,
        coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        details: "Detailed place information would be fetched from a places database or API"
      }
    });
  } catch (error) {
    console.error("Get place details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get place details",
      error: error.message
    });
  }
};
