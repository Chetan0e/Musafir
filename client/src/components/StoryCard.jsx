import { motion } from 'framer-motion';
import { MapPin, Heart, MessageCircle, Calendar } from 'lucide-react';
import { storyAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function StoryCard({ story, onUpdate }) {
  const { isAuthenticated } = useAuth();

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      await storyAPI.like(story._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="card overflow-hidden"
    >
      {story.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{story.location}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {story.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isAuthenticated ? 'hover:text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">{story.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-primary-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{story.comments?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
