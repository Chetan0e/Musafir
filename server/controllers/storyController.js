import Story from "../models/Story.js";
import User from "../models/User.js";

// @desc    Create new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req, res) => {
  try {
    const { title, location, destination, content, images, tags, trip } = req.body;

    if (!title || !location || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide title, location, and content" 
      });
    }

    // Handle uploaded file
    let coverImage = null;
    if (req.file) {
      coverImage = `/uploads/stories/${req.file.filename}`;
    }

    const storyData = {
      user: req.user.id,
      title: title.trim(),
      location: location.trim(),
      destination: destination?.trim() || location.trim(),
      content: content.trim(),
      coverImage: coverImage,
      images: images || [],
      tags: tags || [],
      trip: trip || null,
      isPublished: true
    };

    const story = await Story.create(storyData);

    // Populate user info
    await story.populate("user", "name avatar");

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "stats.storiesWritten": 1 }
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: story
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all published stories
// @route   GET /api/stories
// @access  Public
export const getAllStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, destination, tag } = req.query;

    const query = { 
      isPublished: true,
      isDeleted: false 
    };

    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stories = await Story.find(query)
      .populate("user", "_id name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get all stories error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single story by ID
// @route   GET /api/stories/:id
// @access  Public
export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user", "name avatar")
      .populate("trip", "title destination");

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Increment view count
    story.viewCount += 1;
    await story.save();

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error("Get story error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get current user's stories
// @route   GET /api/stories/my-stories
// @access  Private
export const getMyStories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stories = await Story.find({ 
      user: req.user.id,
      isDeleted: false 
    })
      .populate("user", "_id name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Story.countDocuments({ 
      user: req.user.id,
      isDeleted: false 
    });

    res.json({
      success: true,
      data: stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get my stories error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Like/unlike story
// @route   POST /api/stories/:id/like
// @access  Private
export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    const userId = req.user.id;
    const hasLiked = story.likes.includes(userId);

    if (hasLiked) {
      await story.removeLike(userId);
    } else {
      await story.addLike(userId);
    }

    res.json({
      success: true,
      data: { 
        likesCount: story.likesCount,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    console.error("Like story error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Add comment to story
// @route   POST /api/stories/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide comment text"
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    await story.addComment(req.user.id, text.trim());
    await story.populate("comments.user", "name avatar");

    res.json({
      success: true,
      message: "Comment added",
      data: {
        comments: story.comments,
        commentsCount: story.commentsCount
      }
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
export const updateStory = async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Check ownership
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { title, location, destination, content, coverImage, images, tags, isPublished } = req.body;

    const updates = {};
    if (title) updates.title = title.trim();
    if (location) updates.location = location.trim();
    if (destination) updates.destination = destination.trim();
    if (content) updates.content = content.trim();
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (images) updates.images = images;
    if (tags) updates.tags = tags;
    if (isPublished !== undefined) updates.isPublished = isPublished;

    story = await Story.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "name avatar");

    res.json({
      success: true,
      message: "Story updated successfully",
      data: story
    });
  } catch (error) {
    console.error("Update story error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete story (soft delete)
// @route   DELETE /api/stories/:id
// @access  Private
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Check ownership
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Soft delete
    story.isDeleted = true;
    await story.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "stats.storiesWritten": -1 }
    });

    res.json({
      success: true,
      message: "Story deleted successfully"
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
