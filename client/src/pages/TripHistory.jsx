import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tripAPI } from '../api/api.js';
import { Button, Card, Badge, SkeletonCard } from '../components/ui/index.js';
import { 
  MapPin, Clock, Users, Wallet, ArrowRight, Search,
  Filter, Calendar, Trash2, Compass
} from 'lucide-react';

export default function TripHistory() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?._id) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.getUserTrips({ userId: user._id });
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripAPI.delete(tripId);
      setTrips(trips.filter(t => t._id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || trip.budget === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
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
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Compass className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-text-primary">
                My <span className="italic text-accent">Trips</span>
              </h1>
              <p className="text-text-secondary">
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
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
              placeholder="Search trips by destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="all">All Budgets</option>
              <option value="budget">Budget</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
            
            <Link to="/plan">
              <Button leftIcon={<Compass className="w-4 h-4" />}>
                Plan New Trip
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <MapPin className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchTerm ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Start planning your first adventure with our AI trip planner'}
            </p>
            <Link to="/plan">
              <Button>Plan Your First Trip</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col" hover>
                  {/* Image placeholder with destination initials */}
                  <div className="h-32 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-3xl font-display font-semibold text-accent/60">
                      {trip.destination?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={trip.budget === 'luxury' ? 'success' : 'default'} size="sm">
                        {trip.budget}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {trip.destination}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                      {trip.summary}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {trip.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {trip.travelers}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Link to={`/trips/${trip._id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
