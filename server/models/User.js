import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email"
    ]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    currency: { type: String, default: "INR" },
    language: { type: String, default: "en" },
    travelStyle: [{ type: String }],
    interests: [{ type: String }]
  },
  stats: {
    totalTrips: { type: Number, default: 0 },
    countriesVisited: { type: Number, default: 0 },
    storiesWritten: { type: Number, default: 0 },
    totalTripDays: { type: Number, default: 0 }
  },
  aiUsage: {
    queriesThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
userSchema.pre("save", function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    preferences: this.preferences,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

// Method to increment AI usage
userSchema.methods.incrementAIUsage = async function() {
  const now = new Date();
  const lastReset = new Date(this.aiUsage.lastResetDate);
  
  // Reset if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.aiUsage.queriesThisMonth = 1;
    this.aiUsage.lastResetDate = now;
  } else {
    this.aiUsage.queriesThisMonth += 1;
  }
  
  await this.save();
  return this.aiUsage.queriesThisMonth;
};

export default mongoose.model("User", userSchema);
