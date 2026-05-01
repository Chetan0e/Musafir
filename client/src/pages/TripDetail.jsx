import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/api.js';
import { Button, Card, Badge, SkeletonItinerary } from '../components/ui/index.js';
import { 
  MapPin, Calendar, Users, Wallet, ArrowLeft, Download, 
  Clock, Map, Sun, Utensils, Footprints, Share2, Printer,
  ChevronDown, ChevronUp, Navigation
} from 'lucide-react';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState([]);
  const [activeMapDay, setActiveMapDay] = useState(0);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.getTripById(id);
      setTrip(response.data.data);
      // Expand first day by default
      setExpandedDays([0]);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (index) => {
    setExpandedDays(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonItinerary />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Trip not found</h2>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80">
        <img
          src={`https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80`}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center text-text-secondary hover:text-accent mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-text-primary">
              {trip.destination}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Trip Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 mb-8"
        >
          <Badge variant="default" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {trip.duration} days
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {trip.travelers} travelers
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Wallet className="w-4 h-4" /> {trip.budget} budget
          </Badge>
          {trip.totalEstimatedCost && (
            <Badge variant="success" className="flex items-center gap-1">
              <Wallet className="w-4 h-4" /> {trip.totalEstimatedCost}
            </Badge>
          )}
          
          <div className="flex-1" />
          
          <Button variant="secondary" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={handleExportPDF}>
            Print / PDF
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-3">Trip Overview</h2>
                <p className="text-text-secondary leading-relaxed">{trip.summary}</p>
                
                {trip.highlights && trip.highlights.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-text-primary mb-2">Highlights</h3>
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.map((highlight, i) => (
                        <Badge key={i} variant="success">{highlight}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Day by Day */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">Day-by-Day Itinerary</h2>
              
              {trip.itinerary?.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => toggleDay(index)}
                      className="w-full p-4 flex items-center justify-between hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-semibold">{day.day}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-text-primary">{day.title}</h3>
                          <p className="text-sm text-text-secondary">{day.activities?.length || 0} activities</p>
                        </div>
                      </div>
                      {expandedDays.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-text-secondary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-secondary" />
                      )}
                    </button>
                    
                    {expandedDays.includes(index) && (
                      <div className="px-4 pb-4">
                        <div className="ml-7 pl-7 border-l-2 border-border space-y-4">
                          {day.activities?.map((activity, actIndex) => (
                            <div key={actIndex} className="relative">
                              <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-accent/30 border-2 border-accent" />
                              <div className="bg-surface-2 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-text-primary">{activity.name}</h4>
                                  {activity.cost && (
                                    <span className="text-sm text-accent font-medium">{activity.cost}</span>
                                  )}
                                </div>
                                <p className="text-sm text-text-secondary mb-2">{activity.description}</p>
                                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                  {activity.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {activity.duration}
                                    </span>
                                  )}
                                  {activity.type && (
                                    <Badge variant="ghost" size="sm">{activity.type}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Trip Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total Activities</span>
                  <span className="font-medium text-text-primary">
                    {trip.itinerary?.reduce((sum, day) => sum + (day.activities?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Days</span>
                  <span className="font-medium text-text-primary">{trip.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Travelers</span>
                  <span className="font-medium text-text-primary">{trip.travelers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Budget</span>
                  <span className="font-medium text-text-primary capitalize">{trip.budget}</span>
                </div>
              </div>
            </Card>

            {/* Interests */}
            {trip.interests && trip.interests.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-text-primary mb-3">Trip Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.interests.map((interest, i) => (
                    <Badge key={i} variant="ghost">{interest}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" leftIcon={<Navigation className="w-4 h-4" />}>
                  Get Directions
                </Button>
                <Button variant="ghost" className="w-full justify-start text-danger" leftIcon={<Download className="w-4 h-4" />}>
                  Delete Trip
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
