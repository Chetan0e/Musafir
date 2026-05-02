import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    enum: ["morning", "afternoon", "evening", "night"],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: "2 hours"
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ["sightseeing", "food", "adventure", "culture", "shopping", "relaxation", "transport", "nightlife", "other"],
    default: "sightseeing"
  },
  location: {
    type: String,
    default: ""
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  tips: {
    type: String,
    default: ""
  },
  mustTry: {
    type: String,
    default: ""
  }
}, { _id: true });

const daySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    default: ""
  },
  theme: {
    type: String,
    default: ""
  },
  activities: [activitySchema],
  meals: {
    breakfast: { type: String, default: "" },
    lunch: { type: String, default: "" },
    dinner: { type: String, default: "" }
  },
  accommodation: {
    type: String,
    default: ""
  },
  localTransport: {
    type: String,
    default: ""
  },
  dayBudget: {
    type: Number,
    default: 0
  }
}, { _id: true });

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  destinationCoords: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  coverImage: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  travelers: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 1
  },
  budget: {
    type: String,
    required: true,
    enum: ["budget", "moderate", "comfort", "luxury"]
  },
  travelType: {
    type: String,
    required: true,
    enum: ["solo", "couple", "family", "group", "balanced", "adventure", "cultural", "relaxation", "backpacker", "luxury", "business"]
  },
  interests: [{
    type: String,
    enum: ["adventure", "food", "culture", "history", "nature", "nightlife", "shopping", "wellness", "photography", "local experiences"]
  }],
  specialRequests: {
    type: String,
    default: ""
  },
  overview: {
    type: String,
    default: ""
  },
  bestTimeToVisit: {
    type: String,
    default: ""
  },
  localLanguage: {
    type: String,
    default: ""
  },
  currency: {
    type: String,
    default: "INR"
  },
  itinerary: [daySchema],
  packingList: [{
    type: String
  }],
  emergencyContacts: {
    police: { type: String, default: "100" },
    ambulance: { type: String, default: "108" },
    "tourist helpline": { type: String, default: "1363" }
  },
  usefulApps: [{
    type: String
  }],
  totalEstimatedCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["planning", "upcoming", "completed"],
    default: "planning"
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ destination: 1 });
tripSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for trip duration in days
tripSchema.virtual("duration").get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return this.days;
});

// Method to update status based on dates
tripSchema.methods.updateStatus = function() {
  const now = new Date();
  if (this.endDate < now) {
    this.status = "completed";
  } else if (this.startDate > now) {
    this.status = "upcoming";
  } else {
    this.status = "planning";
  }
  return this.status;
};

// Static method to get user's trip stats
tripSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        countriesVisited: { $addToSet: "$destination" },
        totalTripDays: { $sum: "$days" },
        upcomingTrips: {
          $sum: {
            $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalTrips: 0,
    countriesVisited: [],
    totalTripDays: 0,
    upcomingTrips: 0
  };
};

export default mongoose.model("Trip", tripSchema);
