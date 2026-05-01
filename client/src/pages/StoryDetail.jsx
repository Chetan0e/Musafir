import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { storyAPI } from '../api/api.js';
import { Button, Card, Badge, SkeletonCard } from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ArrowLeft, MapPin, Heart, MessageCircle, Share2, 
  Calendar, User, Send, Loader2
} from 'lucide-react';
import { formatDate, getInitials } from '../utils/formatters.js';

export default function StoryDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getStoryById(id);
      setStory(response.data.data);
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      await storyAPI.like(id);
      fetchStory();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;
    
    setSubmittingComment(true);
    try {
      await storyAPI.addComment(id, { text: comment });
      setComment('');
      fetchStory();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Story not found</h2>
          <Link to="/stories">
            <Button>Browse Stories</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isLiked = story.likes?.includes(user?._id);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            to="/stories" 
            className="inline-flex items-center text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stories
          </Link>
        </motion.div>

        {/* Story Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-lg font-medium text-accent">
                  {getInitials(story.user?.name)}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-text-primary">{story.user?.name}</h3>
                <p className="text-sm text-text-secondary">{formatDate(story.createdAt)}</p>
              </div>
            </div>

            {/* Location Badge */}
            <Badge variant="default" className="mb-4 flex items-center gap-1 w-fit">
              <MapPin className="w-3 h-3" /> {story.location}
            </Badge>

            {/* Title */}
            <h1 className="font-display text-3xl font-semibold text-text-primary mb-6">
              {story.title}
            </h1>

            {/* Image */}
            {story.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? 'text-accent' : 'text-text-secondary hover:text-accent'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{story.likes?.length || 0} likes</span>
                </button>
                <button className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{story.comments?.length || 0} comments</span>
                </button>
              </div>
              <button className="text-text-secondary hover:text-accent transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Comments ({story.comments?.length || 0})
          </h2>

          {/* Comment Form */}
          {isAuthenticated && (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                />
                <Button 
                  type="submit" 
                  disabled={!comment.trim() || submittingComment}
                  isLoading={submittingComment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {story.comments?.length === 0 ? (
              <p className="text-text-secondary text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              story.comments?.map((comment, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-accent">
                        {getInitials(comment.user?.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary">{comment.user?.name}</span>
                        <span className="text-sm text-text-tertiary">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-text-secondary">{comment.text}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
