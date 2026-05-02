import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tripAPI, storyAPI } from '../api/api.js';
import { Button, Card, Badge, SkeletonCard } from '../components/ui/index.js';
import {
  LayoutDashboard, MapPin, BookOpen, Trash2,
  Compass, Plus, ArrowRight, Clock, Users, Wallet,
  Settings, LogOut, Map, Heart, TrendingUp, Sparkles, Menu, X
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [trips, setTrips] = useState([]);
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalStories: 0,
    totalDestinations: 0
  });
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated || !user?._id) {
      setDataLoaded(true);
      return;
    }

    try {
      setLoading(true);
      const [tripsRes, storiesRes] = await Promise.all([
        tripAPI.getUserTrips(),
        storyAPI.getMyStories()
      ]);

      // Handle both data.data and data.trips response structures
      const tripsData = tripsRes.data.trips || tripsRes.data.data || [];
      const storiesData = storiesRes.data.stories || storiesRes.data.data || [];

      setTrips(tripsData);
      setStories(storiesData);

      // Calculate unique destinations
      const uniqueDests = new Set(tripsData.map(t => t.destination?.toLowerCase()).filter(Boolean));

      setStats({
        totalTrips: tripsData.length,
        totalStories: storiesData.length,
        totalDestinations: uniqueDests.size,
        upcomingTrips: tripsData.filter(t => t.status === 'upcoming' || t.status === 'planning').length
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setTrips([]);
      setStories([]);
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated, user?._id]);

  // Refresh data when dashboard becomes visible or window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserData();
      }
    };
    const handleFocus = () => {
      fetchUserData();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUserData]);

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripAPI.delete(tripId);
      setTrips(trips.filter(trip => trip._id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading only on initial load, not forever
  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <LayoutDashboard className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Welcome to Musafir</h2>
          <p className="text-text-secondary mb-6">Sign in to view your trips, stories, and travel dashboard.</p>
          <Link to="/auth">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'trips', label: 'My Trips', icon: MapPin },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-surface border-r border-border min-h-screen
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Compass className="w-5 h-5 text-accent" />
              </div>
              <span className="font-display text-xl font-semibold text-text-primary italic">
                Musafir
              </span>
            </Link>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'settings') {
                        navigate('/dashboard/settings');
                      } else {
                        setActiveTab(item.id);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${activeTab === item.id
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              <button
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 lg:ml-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 mt-12 lg:mt-0"
          >
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-semibold text-text-primary">
                Welcome back, <span className="italic text-accent">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-text-secondary mt-1">
                Here's what's happening with your travels
              </p>
            </div>
            <Link to="/plan">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Plan New Trip
              </Button>
            </Link>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: MapPin, label: 'Total Trips', value: stats.totalTrips, color: 'accent' },
                  { icon: Map, label: 'Destinations', value: stats.totalDestinations, color: 'success' },
                  { icon: BookOpen, label: 'Stories', value: stats.totalStories, color: 'info' },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-text-secondary text-sm">{stat.label}</p>
                            <p className="text-3xl font-semibold text-text-primary mt-1">{stat.value}</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-accent" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent Trips & Quick Actions */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Trips */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-text-primary">Recent Trips</h2>
                    <button 
                      onClick={() => setActiveTab('trips')}
                      className="text-accent text-sm hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  
                  {trips.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">No trips yet</h3>
                      <p className="text-text-secondary mb-4">Start planning your first adventure</p>
                      <Link to="/plan">
                        <Button size="sm">Plan a Trip</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {trips.slice(0, 3).map((trip) => (
                        <Link key={trip._id} to={`/trips/${trip._id}`}>
                          <Card className="p-4 hover:border-accent/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <MapPin className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-text-primary">{trip.destination}</h3>
                                  <p className="text-sm text-text-secondary">
                                    {trip.days || trip.duration} days • {trip.budget} budget
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-text-tertiary" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link to="/plan">
                      <Card className="p-4 hover:bg-surface-2 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary">Plan with AI</h3>
                            <p className="text-sm text-text-secondary">Generate itinerary</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                    <Link to="/scan">
                      <Card className="p-4 hover:bg-surface-2 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Compass className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary">Scan Place</h3>
                            <p className="text-sm text-text-secondary">Identify landmarks</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                    <Link to="/stories">
                      <Card className="p-4 hover:bg-surface-2 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary">Share Story</h3>
                            <p className="text-sm text-text-secondary">Write about travels</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">All Trips</h2>
              {trips.length === 0 ? (
                <Card className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No trips saved yet</h3>
                  <p className="text-text-secondary mb-4">Start planning your first adventure</p>
                  <Link to="/plan">
                    <Button>Plan Your First Trip</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {trips.map((trip) => (
                    <Card key={trip._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <Link to={`/trips/${trip._id}`} className="flex-1">
                          <h3 className="font-semibold text-text-primary text-lg">{trip.destination}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {trip.days || trip.duration} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {trip.travelers} travelers
                            </span>
                            <span className="flex items-center gap-1">
                              <Wallet className="w-4 h-4" /> {trip.budget}
                            </span>
                          </div>
                          <p className="text-text-secondary mt-2 text-sm line-clamp-2">
                            {trip.summary}
                          </p>
                        </Link>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors ml-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">My Stories</h2>
                <Link to="/stories">
                  <Button variant="secondary" size="sm">View All Stories</Button>
                </Link>
              </div>
              {stories.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No stories yet</h3>
                  <p className="text-text-secondary mb-4">Share your travel experiences</p>
                  <Link to="/stories">
                    <Button size="sm">Explore Stories</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {stories.map((story) => (
                    <Card key={story._id} className="p-4 hover:border-accent/30 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-text-primary">{story.title}</h3>
                      <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {story.location}
                      </p>
                      <p className="text-text-secondary text-sm mt-2 line-clamp-2">
                        {story.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {story.likes?.length || 0}
                        </span>
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

