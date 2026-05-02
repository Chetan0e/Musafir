import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { storyAPI } from '../api/api.js';
import { Button, Card, Badge, SkeletonCard } from '../components/ui/index.js';
import {
  BookOpen, Plus, Search, MapPin, Heart, MessageCircle,
  Calendar, User, X, Camera, Upload, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, getInitials } from '../utils/formatters.js';
import { toast } from 'react-hot-toast';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user, isAuthenticated } = useAuth();

  const [newStory, setNewStory] = useState({
    title: '',
    location: '',
    content: '',
    coverImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchStories();
    } else {
      fetchMyStories();
    }
  }, [activeTab]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getAll();
      setStories(response.data.stories || response.data.data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getMyStories();
      setStories(response.data.stories || response.data.data || []);
    } catch (error) {
      console.error('Error fetching my stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setNewStory({ ...newStory, coverImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setNewStory({ ...newStory, coverImage: null });
    setImagePreview(null);
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newStory.title);
      formData.append('location', newStory.location);
      formData.append('content', newStory.content);
      if (newStory.coverImage) {
        formData.append('image', newStory.coverImage); // Changed from 'coverImage' to 'image'
      }

      await storyAPI.create(formData);
      setNewStory({ title: '', location: '', content: '', coverImage: null });
      setImagePreview(null);
      setShowCreateForm(false);
      toast.success('Story shared successfully!');
      if (activeTab === 'my') {
        fetchMyStories();
      } else {
        fetchStories();
      }
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error(error.response?.data?.message || 'Failed to share story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (storyId) => {
    if (!isAuthenticated) {
      toast.error('Sign in to like stories');
      return;
    }

    try {
      const response = await storyAPI.like(storyId);
      const { liked, likeCount, likes } = response.data;

      // Update story in local state immediately (optimistic update)
      setStories(prev => prev.map(story =>
        story._id === storyId
          ? { ...story, likes: likes, likeCount }
          : story
      ));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const filteredStories = stories.filter(story =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compare user IDs as strings to handle ObjectId vs string comparison
  const userStories = stories.filter(s => {
    const storyAuthorId = s.author?._id?.toString() || s.author?.toString();
    const currentUserId = user?._id?.toString() || user?.toString();
    const isMatch = storyAuthorId && currentUserId && storyAuthorId === currentUserId;
    return isMatch;
  });

  const displayStories = activeTab === 'my' ? userStories : filteredStories;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-text-primary mb-4">
            Travel <span className="italic text-accent">Stories</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Discover authentic travel experiences shared by our community of explorers
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search stories by destination or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>
          
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button 
                variant={activeTab === 'my' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(activeTab === 'my' ? 'all' : 'my')}
              >
                My Stories
              </Button>
            )}
            {isAuthenticated && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Share Story
              </Button>
            )}
          </div>
        </motion.div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">Share Your Story</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateStory} className="space-y-4">
                  <input
                    type="text"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    placeholder="Story title"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                    required
                  />
                  <input
                    type="text"
                    value={newStory.location}
                    onChange={(e) => setNewStory({ ...newStory, location: e.target.value })}
                    placeholder="Where did you go?"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                    required
                  />

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary">Cover Image</label>
                    {!imagePreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="story-image"
                        />
                        <label
                          htmlFor="story-image"
                          className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-surface-2 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-text-tertiary mb-2" />
                          <span className="text-text-secondary text-sm">Click to upload an image</span>
                          <span className="text-text-tertiary text-xs mt-1">JPG, PNG (max 5MB)</span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg text-danger hover:bg-danger hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={newStory.content}
                    onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                    placeholder="Share your experience..."
                    rows={5}
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent resize-none"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Publish Story
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Stories Grid */}
        {displayStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {activeTab === 'my' ? 'You haven\'t shared any stories yet' : 'No stories found'}
            </h3>
            <p className="text-text-secondary">
              {activeTab === 'my' ? 'Share your first travel experience!' : 'Try a different search term'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStories.map((story, index) => {
              const isLiked = story.likes?.some(id => id === user?._id || id?._id === user?._id || id?.toString() === user?._id?.toString());
              const imageSource = story.image || story.coverImage || null;

              return (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col" hover>
                    {/* Image */}
                    <div className="aspect-[16/10] bg-surface-2 rounded-lg overflow-hidden mb-4">
                      {imageSource ? (
                        <img
                          src={imageSource}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        // Destination-based Unsplash image as final fallback
                        <img
                          src={`https://source.unsplash.com/600x400/?${encodeURIComponent(story.destination || story.location)},travel`}
                          alt={story.destination || story.location}
                          onError={(e) => {
                            e.target.parentElement.classList.add('no-image');
                          }}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="ghost" size="sm" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {story.location}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-4">
                        {story.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-accent">
                            {getInitials(story.author?.name)}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary">{story.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(story._id)}
                          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-accent' : 'text-text-secondary'}`}
                          style={{ color: isLiked ? '#EF4444' : 'currentColor' }}
                        >
                          <svg viewBox="0 0 24 24" fill={isLiked ? '#EF4444' : 'none'} stroke={isLiked ? '#EF4444' : 'currentColor'} strokeWidth="2" className="w-4 h-4">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          <span>{story.likes?.length || 0}</span>
                        </button>
                        <span className="text-sm text-text-tertiary">
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

