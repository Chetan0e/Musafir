import axios from "axios";

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
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await axios.post(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'google/gemini-2.0-flash-001',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: dataUrl }
              },
              {
                type: 'text',
                text: `You are an expert travel guide and landmark recognition AI. 
Analyze this image and identify the location/landmark shown.
Respond ONLY with valid JSON (no markdown, no explanation):
{
  "identified": true,
  "placeName": "Exact real name of the place",
  "localName": "Name in local language if applicable",
  "location": {
    "city": "city name",
    "state": "state/region",
    "country": "country name",
    "continent": "continent"
  },
  "confidence": 95,
  "placeType": "temple/museum/beach/mountain/palace/market/park/monument/etc",
  "overview": "2-3 sentences about what makes this place special",
  "historicalSignificance": "Historical background and importance",
  "whyVisit": "Why tourists love visiting this place",
  "bestTimeToVisit": "Recommended months or season to visit",
  "entryFee": "Free / ₹500 / $10 / etc",
  "openingHours": "6 AM - 8 PM daily / 24/7 / etc",
  "howToReach": "How to get there from the nearest major city",
  "insiderTips": [
    "Specific tip 1 most tourists don't know",
    "Specific tip 2",
    "Specific tip 3"
  ],
  "nearbyAttractions": ["Real nearby place 1", "Real nearby place 2", "Real nearby place 3"],
  "photographySpots": "Best spots and angles for photography here",
  "localCuisine": ["Specific dish 1 from this region", "Specific dish 2"],
  "estimatedVisitDuration": "1-2 hours",
  "crowdLevel": "low/medium/high",
  "accessibilityInfo": "Wheelchair accessible / Involves climbing / etc",
  "travelTips": "Overall advice for visiting this specific place"
}
If you cannot identify the specific location, still describe what you can see:
{
  "identified": false,
  "placeType": "what type of place it appears to be",
  "visibleFeatures": "what you can see in the image",
  "possibleLocations": ["country or region it might be in"],
  "message": "Could not identify exact location. Try a clearer image of the landmark.",
  "suggestedSearchTerms": ["term1", "term2"]
}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL,
          'X-Title': 'Musafir Place Scanner'
        }
      }
    );

    let rawContent = response.data.choices[0].message.content;
    rawContent = rawContent.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    const jsonStart = rawContent.indexOf('{');
    const jsonEnd = rawContent.lastIndexOf('}');
    const jsonStr = rawContent.substring(jsonStart, jsonEnd + 1);
    const placeData = JSON.parse(jsonStr);

    return res.json({ success: true, data: placeData });

  } catch (error) {
    console.error('Place identify error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to identify place',
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
