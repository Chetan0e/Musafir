import Story from "../models/Story.js";
import User from "../models/User.js";
import axios from "axios";

// @desc    Create new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req, res) => {
  try {
    const { title, location, destination, content, images, tags, trip } = req.body;
    const userId = req.user.id;

    if (!title || !location || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, location, and content"
      });
    }

    // Handle image: convert to base64 if file uploaded, or use URL
    let imageData = null;
    if (req.file) {
      // Convert uploaded file to base64 data URL
      const base64 = req.file.buffer.toString('base64');
      imageData = `data:${req.file.mimetype};base64,${base64}`;
    }

    // Fetch Unsplash image for destination as fallback cover
    let coverImage = null;
    if (process.env.UNSPLASH_ACCESS_KEY) {
      try {
        const unsplashRes = await axios.get('https://api.unsplash.com/search/photos', {
          params: { query: destination || location, per_page: 1, orientation: 'landscape' },
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
        });
        coverImage = unsplashRes.data.results[0]?.urls?.regular || null;
      } catch(e) { /* continue without */ }
    }

    const story = new Story({
      author: userId,
      title,
      content,
      destination: destination || location,
      location,
      image: imageData,       // base64 or null
      coverImage: coverImage, // Unsplash URL fallback
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    });

    await story.save();

    // Populate author details before returning
    await story.populate('author', 'name email');

    return res.status(201).json({ success: true, story });
  } catch (error) {
    console.error('Create story error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all published stories
// @route   GET /api/stories
// @access  Public
export const getAllStories = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    let query = { isPublic: true, isDeleted: false };
    if (search) {
      query.$or = [
        { destination: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const stories = await Story.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.json({ success: true, stories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    const userId = req.user.id;

    const stories = await Story.find({ author: userId, isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, stories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on a story
// @route   POST /api/stories/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const isLiked = story.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      story.likes = story.likes.filter(id => id.toString() !== userId.toString());
    } else {
      story.likes.push(userId);
    }

    await story.save();

    return res.json({
      success: true,
      liked: !isLiked,
      likeCount: story.likes.length,
      likes: story.likes
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ message: error.message });
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
