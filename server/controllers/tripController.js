import Trip from "../models/Trip.js";
import User from "../models/User.js";
import axios from "axios";
import fs from "fs";

// Mock trip generator for fallback when API fails
const generateMockTrip = (destination, days, budget, travelType, interests) => {
  const budgetDescriptions = {
    budget: { daily: 2500, hotel: "Budget hostel/guesthouse", food: "Street food & local cafes" },
    moderate: { daily: 6000, hotel: "Mid-range hotel", food: "Good restaurants & cafes" },
    comfort: { daily: 6000, hotel: "Mid-range hotel", food: "Good restaurants & cafes" },
    luxury: { daily: 15000, hotel: "Premium hotel/resort", food: "Fine dining" }
  };
  const bd = budgetDescriptions[budget] || budgetDescriptions.moderate;
  
  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      day: i,
      date: `Day ${i}`,
      theme: i === 1 ? "Arrival & First Impressions" : i === days ? "Final Day & Departure" : `Exploring ${destination}`,
      activities: [
        {
          time: "morning",
          name: `Famous landmark ${i} in ${destination}`,
          description: `Explore the beautiful attractions of ${destination}. Perfect for ${interests.slice(0, 2).join(" and ")} lovers.`,
          duration: "2-3 hours",
          estimatedCost: Math.floor(bd.daily * 0.3),
          category: "sightseeing",
          location: `Central ${destination}`,
          tips: "Visit early morning to avoid crowds",
          mustTry: "Local specialty dish"
        },
        {
          time: "afternoon",
          name: `Cultural experience ${i}`,
          description: `Immerse yourself in local culture and traditions of ${destination}.`,
          duration: "2-3 hours",
          estimatedCost: Math.floor(bd.daily * 0.4),
          category: "culture",
          location: `Old Town ${destination}`,
          tips: "Bring comfortable walking shoes",
          mustTry: "Traditional craft workshop"
        },
        {
          time: "evening",
          name: `Evening entertainment ${i}`,
          description: `Enjoy the vibrant nightlife and dining scene of ${destination}.`,
          duration: "2-3 hours",
          estimatedCost: Math.floor(bd.daily * 0.3),
          category: "nightlife",
          location: `Downtown ${destination}`,
          tips: "Make dinner reservations in advance",
          mustTry: "Signature cocktail at rooftop bar"
        }
      ],
      meals: {
        breakfast: `Local breakfast cafe - ${bd.food}`,
        lunch: `Popular local restaurant - Regional specialties`,
        dinner: `Recommended restaurant - ${bd.food}`
      },
      accommodation: bd.hotel,
      localTransport: "Walking, taxi, or local transport",
      dayBudget: bd.daily
    });
  }
  
  return JSON.stringify({
    title: `${destination} ${days}-Day ${travelType.charAt(0).toUpperCase() + travelType.slice(1)} Trip`,
    destination: destination,
    overview: `Experience the best of ${destination} with this carefully crafted ${days}-day itinerary. Perfect for travelers interested in ${interests.join(", ") || "sightseeing and culture"}.`,
    highlights: [`Top attractions in ${destination}`, `Best ${interests[0] || "cultural"} experiences`, `Local cuisine highlights`, `Hidden gems and local favorites`],
    bestTimeToVisit: "Spring (March-May) and Autumn (September-November)",
    localLanguage: "Local language with English commonly spoken in tourist areas",
    currency: "Local Currency",
    totalEstimatedCost: bd.daily * days,
    itinerary: itinerary,
    packingList: ["Comfortable walking shoes", "Weather-appropriate clothing", "Camera", "Travel adapter", "Sunscreen", "Day bag/backpack"],
    emergencyContacts: { police: "100", ambulance: "108", "tourist helpline": "1363" },
    usefulApps: ["Google Maps", "Translation app", "Local transport app", "Currency converter"]
  });
};

// Helper function to call OpenRouter API
const callOpenRouter = async (messages, temperature = 0.7, maxTokens = 2000) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("API Key check - exists:", !!apiKey, "length:", apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const apiUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";
  console.log("Calling OpenRouter API at:", apiUrl);
  console.log("Using model: meta-llama/llama-3.1-8b-instruct:free");
  
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "meta-llama/llama-3.1-8b-instruct:free",
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
        },
        timeout: 30000
      }
    );

    console.log("OpenRouter response status:", response.status);
    
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error("Unexpected API response structure:", JSON.stringify(response.data).substring(0, 500));
      throw new Error("Invalid API response structure");
    }
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API error:", error.message);
    if (error.response) {
      console.error("API error status:", error.response.status);
      console.error("API error data:", typeof error.response.data === 'string' 
        ? error.response.data.substring(0, 500) 
        : JSON.stringify(error.response.data));
    }
    throw error;
  }
};

// Helper function to fetch Unsplash image
const fetchUnsplashImage = async (query) => {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return null;
    }

    const response = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    console.error("Unsplash fetch error:", error.message);
    return null;
  }
};

// Helper function to geocode destination
const geocodeDestination = async (destination) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "Musafir/2.0"
        }
      }
    );

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

// @desc    Generate AI itinerary
// @route   POST /api/trips/generate
// @access  Public (with optional auth)
export const generateTrip = async (req, res) => {
  try {
    console.log("Generate trip request body:", JSON.stringify(req.body, null, 2));
    
    const { 
      destination, 
      duration, 
      startDate, 
      endDate, 
      travelers = 1, 
      budget, 
      travelType, 
      style,
      interests = [], 
      specialRequests = "" 
    } = req.body;

    // Validation - accept either duration or start/end dates
    if (!destination || !budget) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide destination and budget" 
      });
    }

    // Calculate days from duration or start/end dates
    let days;
    let start, end;
    
    if (duration && duration > 0) {
      days = duration;
      start = new Date();
      end = new Date();
      end.setDate(end.getDate() + days - 1);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either duration or start/end dates"
      });
    }

    if (days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        message: "Trip duration must be between 1 and 30 days"
      });
    }

    // Use style if travelType not provided
    const travelTypeFinal = travelType || style || 'balanced';

    // Budget mapping (handle both old and new budget values)
    const budgetDescriptions = {
      budget: "₹2000-5000/day - budget accommodations, local transport, street food",
      moderate: "₹5000-15000/day - mid-range hotels, taxis, good restaurants",
      comfort: "₹5000-15000/day - mid-range hotels, taxis, good restaurants",
      luxury: "₹15000+/day - premium hotels, private transport, fine dining"
    };
    
    const budgetDescription = budgetDescriptions[budget] || budgetDescriptions.comfort;

    const systemPrompt = `You are an expert travel planner with deep knowledge of Indian and international destinations. Generate a detailed, day-by-day travel itinerary in valid JSON format only (no markdown, no explanation text).`;

    const userPrompt = `Trip Details:

Destination: ${destination}
Duration: ${days} days (${start.toDateString()} to ${end.toDateString()})
Travelers: ${travelers} people
Budget Level: ${budget} (${budgetDescription})
Travel Type: ${travelTypeFinal}
Interests: ${interests.join(", ") || "general"}
Special Requests: ${specialRequests || "None"}

Return ONLY a JSON object with this structure:
{
  "title": "descriptive trip title",
  "destination": "city, country",
  "overview": "2-3 sentence trip overview",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "bestTimeToVisit": "months/season info",
  "localLanguage": "primary language(s)",
  "currency": "INR",
  "totalEstimatedCost": 15000,
  "itinerary": [
    {
      "day": 1,
      "date": "Day 1 - ${startDate}",
      "theme": "Arrival & First Impressions",
      "activities": [
        {
          "time": "morning",
          "name": "Specific Place Name",
          "description": "Detailed description with what to see and do",
          "duration": "2-3 hours",
          "estimatedCost": 500,
          "category": "sightseeing",
          "location": "Specific address or area",
          "tips": "Practical insider tip",
          "mustTry": "specific food/experience at this place"
        }
      ],
      "meals": {
        "breakfast": "specific restaurant name + dish recommendation",
        "lunch": "specific restaurant name + dish recommendation",
        "dinner": "specific restaurant name + dish recommendation"
      },
      "accommodation": "specific area or hotel recommendation for budget level",
      "localTransport": "how to get around on this day",
      "dayBudget": 3500
    }
  ],
  "packingList": ["item1", "item2"],
  "emergencyContacts": { "police": "100", "ambulance": "108", "tourist helpline": "1363" },
  "usefulApps": ["app1", "app2"]
}

Make all recommendations specific to the destination and budget level. Include real place names, restaurants, and practical tips.`;

    // Call OpenRouter API
    let aiResponse;
    try {
      aiResponse = await callOpenRouter([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], 0.7, 4000);
    } catch (apiError) {
      console.error("OpenRouter API failed, using fallback mock data");
      // Fallback mock response for testing
      aiResponse = generateMockTrip(destination, days, budget, travelTypeFinal, interests);
    }

    // Parse JSON from response
    let tripData;
    try {
      // Extract JSON if wrapped in markdown code blocks
      let jsonStr = aiResponse;
      const codeBlockMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      tripData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("AI response:", aiResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
        error: "JSON_PARSE_ERROR"
      });
    }

    // Fetch cover image from Unsplash
    const coverImage = await fetchUnsplashImage(destination);

    // Geocode destination
    const coords = await geocodeDestination(destination);

    // Calculate totals
    const totalCost = tripData.itinerary.reduce((sum, day) => sum + (day.dayBudget || 0), 0);

    // Construct response
    const generatedTrip = {
      title: tripData.title || `${destination} Adventure`,
      destination: tripData.destination || destination,
      destinationCoords: coords,
      coverImage,
      startDate: start,
      endDate: end,
      days,
      travelers,
      budget,
      travelType: travelTypeFinal,
      interests,
      specialRequests,
      overview: tripData.overview || "",
      summary: tripData.overview || "", // Alias for client compatibility
      bestTimeToVisit: tripData.bestTimeToVisit || "",
      localLanguage: tripData.localLanguage || "",
      currency: tripData.currency || "INR",
      itinerary: tripData.itinerary || [],
      highlights: tripData.highlights || [],
      packingList: tripData.packingList || [],
      emergencyContacts: tripData.emergencyContacts || { police: "100", ambulance: "108", "tourist helpline": "1363" },
      usefulApps: tripData.usefulApps || [],
      totalEstimatedCost: tripData.totalEstimatedCost || totalCost,
      isGenerated: true
    };

    // If user is authenticated, increment AI usage
    if (req.user) {
      await req.user.incrementAIUsage();
    }

    res.json({
      success: true,
      data: generatedTrip
    });

  } catch (error) {
    console.error("Generate trip error:", error);
    console.error("Error stack:", error.stack);
    if (error.response) {
      console.error("API response error:", error.response.data);
    }
    
    // Specific error messages
    if (error.message === "OPENROUTER_API_KEY not configured") {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable",
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

    if (error.response?.status === 401) {
      return res.status(503).json({
        success: false,
        message: "AI service configuration error",
        error: "AI_AUTH_ERROR"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate itinerary. Please try again.",
      error: error.message,
      details: error.stack
    });
  }
};

// @desc    Save trip to database
// @route   POST /api/trips/save
// @access  Private
export const saveTrip = async (req, res) => {
  try {
    const tripData = req.body;

    // Validation
    if (!tripData.destination || !tripData.title) {
      return res.status(400).json({
        success: false,
        message: "Please provide destination and title"
      });
    }

    // Create trip
    const trip = await Trip.create({
      ...tripData,
      user: req.user.id,
      status: tripData.status || "planning"
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        "stats.totalTrips": 1,
        "stats.totalTripDays": trip.days || 0
      }
    });

    res.status(201).json({
      success: true,
      message: "Trip saved successfully",
      data: trip
    });
  } catch (error) {
    console.error("Save trip error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all trips for logged in user
// @route   GET /api/trips/user
// @access  Private
export const getUserTrips = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { 
      user: req.user.id,
      isDeleted: false 
    };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      data: trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get user trips error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private (owner) or Public (if isPublic)
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    // Check if user owns the trip or if trip is public
    if (!trip.isPublic && (!req.user || trip.user.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this trip" });
    }

    // Update last viewed
    trip.lastViewedAt = new Date();
    await trip.save();

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "title", "status", "isPublic", "itinerary", "specialRequests",
      "totalEstimatedCost", "packingList", "emergencyContacts", "usefulApps"
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Trip updated successfully",
      data: trip
    });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete trip (soft delete)
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Soft delete
    trip.isDeleted = true;
    await trip.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        "stats.totalTrips": -1,
        "stats.totalTripDays": -trip.days
      }
    });

    res.json({
      success: true,
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get trending destinations
// @route   GET /api/trips/trending
// @access  Public
export const getTrending = async (req, res) => {
  try {
    const trending = await Trip.aggregate([
      { 
        $match: { 
          isPublic: true, 
          isDeleted: false 
        } 
      },
      { 
        $group: { 
          _id: "$destination", 
          count: { $sum: 1 },
          coverImage: { $first: "$coverImage" }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error("Get trending error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get user trip statistics
// @route   GET /api/trips/stats
// @access  Private
export const getUserTripStats = async (req, res) => {
  try {
    const stats = await Trip.getUserStats(req.user.id);
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        totalTrips: stats.totalTrips || 0,
        countriesVisited: stats.countriesVisited?.length || 0,
        totalTripDays: stats.totalTripDays || 0,
        upcomingTrips: stats.upcomingTrips || 0,
        aiQueriesUsed: user?.aiUsage?.queriesThisMonth || 0
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Modify trip with AI
// @route   POST /api/trips/:id/modify
// @access  Private
export const modifyTrip = async (req, res) => {
  try {
    const { modification } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    // Check ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const systemPrompt = `You are an expert travel planner. Modify a trip itinerary based on user request. Return ONLY valid JSON.`;

    const userPrompt = `Current Trip: ${trip.title} to ${trip.destination}
Trip Dates: ${trip.startDate.toDateString()} to ${trip.endDate.toDateString()}
Current Itinerary: ${JSON.stringify(trip.itinerary)}

User Request: ${modification}

Return the modified day/activity in this JSON format:
{
  "modifiedDay": 2,
  "modificationType": "add|remove|modify",
  "activity": {
    "time": "morning",
    "name": "Activity Name",
    "description": "Description",
    "duration": "2 hours",
    "estimatedCost": 500,
    "category": "sightseeing"
  },
  "explanation": "Brief explanation of the change"
}`;

    const aiResponse = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], 0.7, 2000);

    let modificationData;
    try {
      modificationData = JSON.parse(aiResponse);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI modification response"
      });
    }

    // Increment AI usage
    await req.user.incrementAIUsage();

    res.json({
      success: true,
      data: modificationData
    });
  } catch (error) {
    console.error("Modify trip error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
