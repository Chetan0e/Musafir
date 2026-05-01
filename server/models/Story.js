import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const storySchema = new mongoose.Schema({
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
    maxlength: [100, "Title cannot be more than 100 characters"]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    trim: true,
    default: null
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, "Content cannot be more than 5000 characters"]
  },
  excerpt: {
    type: String,
    maxlength: 200,
    default: ""
  },
  coverImage: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  commentsCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ location: 1 });
storySchema.index({ destination: 1 });
storySchema.index({ isPublished: 1, createdAt: -1 });
storySchema.index({ tags: 1 });

// Virtual for like count
storySchema.virtual("likeCount").get(function() {
  return this.likes.length;
});

// Method to add like
storySchema.methods.addLike = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    await this.save();
  }
  return this.likesCount;
};

// Method to remove like
storySchema.methods.removeLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount = this.likes.length;
    await this.save();
  }
  return this.likesCount;
};

// Method to add comment
storySchema.methods.addComment = async function(userId, text) {
  this.comments.push({ user: userId, text });
  this.commentsCount = this.comments.length;
  await this.save();
  return this.commentsCount;
};

// Pre-save hook to generate excerpt
storySchema.pre("save", function(next) {
  if (this.isModified("content") && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200).trim() + (this.content.length > 200 ? "..." : "");
  }
  next();
});

export default mongoose.model("Story", storySchema);
