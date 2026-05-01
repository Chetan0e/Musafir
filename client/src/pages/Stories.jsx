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
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getAll();
      setStories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
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
        formData.append('coverImage', newStory.coverImage);
      }

      await storyAPI.create(formData);
      setNewStory({ title: '', location: '', content: '', coverImage: null });
      setImagePreview(null);
      setShowCreateForm(false);
      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (storyId) => {
    if (!isAuthenticated) return;
    try {
      await storyAPI.like(storyId);
      fetchStories();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compare user IDs as strings to handle ObjectId vs string comparison
  const userStories = stories.filter(s => {
    const storyUserId = s.user?._id?.toString();
    const currentUserId = user?._id?.toString();
    const isMatch = storyUserId && currentUserId && storyUserId === currentUserId;
    console.log('Story user ID:', storyUserId, 'Current user ID:', currentUserId, 'Match:', isMatch);
    return isMatch;
  });

  console.log('Stories - Total:', stories.length, 'User Stories:', userStories.length, 'Active Tab:', activeTab);
  console.log('Current user:', user?._id);

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
            {displayStories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col" hover>
                  {/* Image */}
                  <div className="aspect-[16/10] bg-surface-2 rounded-lg overflow-hidden mb-4">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-text-tertiary" />
                      </div>
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
                          {getInitials(story.user?.name)}
                        </span>
                      </div>
                      <span className="text-sm text-text-secondary">{story.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(story._id)}
                        className={`flex items-center gap-1 text-sm ${
                          story.likes?.includes(user?._id) ? 'text-accent' : 'text-text-secondary'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${story.likes?.includes(user?._id) ? 'fill-current' : ''}`} />
                        {story.likes?.length || 0}
                      </button>
                      <span className="text-sm text-text-tertiary">
                        {formatDate(story.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

