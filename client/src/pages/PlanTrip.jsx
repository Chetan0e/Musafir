import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Users, Wallet, Compass, Sparkles, 
  ArrowRight, Loader2, Check, Clock, Utensils, Camera, 
  Briefcase, Heart, Footprints, ChevronRight
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../components/ui/index.js';
import { tripAPI } from '../api/api.js';

// Budget options
const budgetOptions = [
  { value: 'budget', label: 'Budget', description: 'Backpacker style, hostels & street food', icon: Wallet },
  { value: 'moderate', label: 'Moderate', description: 'Comfortable stays & good food', icon: Wallet },
  { value: 'luxury', label: 'Luxury', description: 'Premium experiences & fine dining', icon: Wallet },
];

// Travel style options
const styleOptions = [
  { value: 'relaxed', label: 'Relaxed', description: 'Fewer activities, more downtime', icon: Clock },
  { value: 'balanced', label: 'Balanced', description: 'Mix of sightseeing and leisure', icon: Compass },
  { value: 'packed', label: 'Packed', description: 'Maximize every moment', icon: Footprints },
];

// Interest options
const interestOptions = [
  { value: 'food', label: 'Food & Dining', icon: Utensils },
  { value: 'culture', label: 'Culture & History', icon: Camera },
  { value: 'adventure', label: 'Adventure', icon: Footprints },
  { value: 'nature', label: 'Nature & Outdoors', icon: Heart },
  { value: 'shopping', label: 'Shopping', icon: Briefcase },
  { value: 'nightlife', label: 'Nightlife', icon: Sparkles },
];

// Popular destinations for quick select
const quickDestinations = [
  'Paris, France',
  'Tokyo, Japan',
  'Bali, Indonesia',
  'New York, USA',
  'Rome, Italy',
  'Santorini, Greece',
  'Jaipur, India',
  'Dubai, UAE',
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  
  const [formData, setFormData] = useState({
    destination: '',
    duration: 5,
    travelers: 2,
    budget: 'moderate',
    travelStyle: 'balanced',
    interests: [],
    specialRequests: '',
  });

  const handleInterestToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await tripAPI.generate({
        destination: formData.destination,
        duration: formData.duration,
        travelers: formData.travelers,
        budget: formData.budget,
        style: formData.travelStyle,
        interests: formData.interests,
        specialRequests: formData.specialRequests,
      });
      
      setGeneratedTrip(response.data.data);
      setStep(3);
    } catch (error) {
      console.error('Error generating trip:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + formData.duration - 1);

      // Properly structure the trip data to match the backend Trip model
      // Map frontend budget values to backend enum values
      const budgetMap = {
        'budget': 'budget',
        'moderate': 'comfort',
        'comfort': 'comfort',
        'luxury': 'luxury'
      };

      // Map travel style to travel type (backend expects: solo, couple, family, group)
      const travelTypeMap = {
        'relaxed': 'solo',
        'balanced': 'couple',
        'packed': 'group'
      };

      const tripData = {
        title: generatedTrip.title || `${formData.destination} ${formData.duration}-Day Trip`,
        destination: formData.destination,
        destinationCoords: generatedTrip.destinationCoords || null,
        coverImage: generatedTrip.coverImage || null,
        startDate: startDate,
        endDate: endDate,
        days: formData.duration,
        travelers: formData.travelers,
        budget: budgetMap[formData.budget] || 'comfort',
        travelType: travelTypeMap[formData.travelStyle] || 'couple',
        interests: formData.interests,
        specialRequests: formData.specialRequests,
        overview: generatedTrip.overview || generatedTrip.summary || '',
        summary: generatedTrip.summary || generatedTrip.overview || '',
        bestTimeToVisit: generatedTrip.bestTimeToVisit || '',
        localLanguage: generatedTrip.localLanguage || '',
        currency: generatedTrip.currency || 'INR',
        itinerary: generatedTrip.itinerary || [],
        highlights: generatedTrip.highlights || [],
        packingList: generatedTrip.packingList || [],
        emergencyContacts: generatedTrip.emergencyContacts || { police: "100", ambulance: "108", "tourist helpline": "1363" },
        usefulApps: generatedTrip.usefulApps || [],
        totalEstimatedCost: generatedTrip.totalEstimatedCost || 0,
        status: 'upcoming'
      };

      console.log('Saving trip with data:', tripData);
      await tripAPI.save(tripData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip: ' + (error.response?.data?.message || error.message));
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.destination && formData.duration > 0;
    if (step === 2) return formData.interests.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-semibold text-text-primary mb-4">
            Plan Your <span className="italic text-accent">Perfect Trip</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Tell us your preferences and let our AI create a personalized itinerary
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                ${step >= s ? 'bg-accent text-black' : 'bg-surface-2 text-text-tertiary'}
                ${step === s ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
              `}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-0.5 mx-2 ${step > s ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="p-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">
                  Where do you want to go?
                </h2>
                
                <div className="space-y-6">
                  <Input
                    label="Destination"
                    placeholder="e.g., Paris, France or Tokyo, Japan"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    leftIcon={<MapPin className="w-5 h-5" />}
                  />

                  {/* Quick select destinations */}
                  <div>
                    <p className="text-sm text-text-secondary mb-3">Popular destinations</p>
                    <div className="flex flex-wrap gap-2">
                      {quickDestinations.map((dest) => (
                        <button
                          key={dest}
                          onClick={() => setFormData({ ...formData, destination: dest })}
                          className={`
                            px-3 py-1.5 rounded-full text-sm border transition-colors
                            ${formData.destination === dest 
                              ? 'border-accent bg-accent/10 text-accent' 
                              : 'border-border text-text-secondary hover:border-accent/50'}
                          `}
                        >
                          {dest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Duration (days)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="1"
                          max="14"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <span className="text-text-primary font-medium w-12 text-right">
                          {formData.duration}d
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Travelers
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setFormData({ ...formData, travelers: Math.max(1, formData.travelers - 1) })}
                          className="w-10 h-10 rounded-lg border border-border hover:bg-surface-2 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium text-text-primary">
                          {formData.travelers}
                        </span>
                        <button
                          onClick={() => setFormData({ ...formData, travelers: Math.min(10, formData.travelers + 1) })}
                          className="w-10 h-10 rounded-lg border border-border hover:bg-surface-2 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Budget Selection */}
              <Card className="p-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">
                  What's your budget?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {budgetOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, budget: option.value })}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${formData.budget === option.value 
                            ? 'border-accent bg-accent/5' 
                            : 'border-border hover:border-accent/30'}
                        `}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${formData.budget === option.value ? 'text-accent' : 'text-text-secondary'}`} />
                        <h3 className="font-medium text-text-primary">{option.label}</h3>
                        <p className="text-sm text-text-secondary mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Travel Style */}
              <Card className="p-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">
                  Travel pace preference?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {styleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, travelStyle: option.value })}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${formData.travelStyle === option.value 
                            ? 'border-accent bg-accent/5' 
                            : 'border-border hover:border-accent/30'}
                        `}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${formData.travelStyle === option.value ? 'text-accent' : 'text-text-secondary'}`} />
                        <h3 className="font-medium text-text-primary">{option.label}</h3>
                        <p className="text-sm text-text-secondary mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  onClick={() => setStep(2)}
                  disabled={!canProceed()}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="p-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-2">
                  What are you interested in?
                </h2>
                <p className="text-text-secondary mb-6">
                  Select at least 2 interests so we can tailor your itinerary
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {interestOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.interests.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleInterestToggle(option.value)}
                        className={`
                          p-4 rounded-lg border-2 text-center transition-all
                          ${isSelected 
                            ? 'border-accent bg-accent/10' 
                            : 'border-border hover:border-accent/30 hover:bg-surface-2'}
                        `}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-accent' : 'text-text-secondary'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  Anything else? (Optional)
                </h2>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g., 'I love coffee shops', 'Need wheelchair accessibility', 'Traveling with kids aged 5 and 8'..."
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent resize-none"
                />
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleGenerate}
                  disabled={!canProceed() || isGenerating}
                  isLoading={isGenerating}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                >
                  Generate Itinerary
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && generatedTrip && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Trip Summary */}
              <Card className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-display font-semibold text-text-primary mb-2">
                      {formData.destination}
                    </h2>
                    <p className="text-text-secondary">
                      {formData.duration} days • {formData.travelers} travelers • {formData.budget} budget
                    </p>
                  </div>
                  <Badge variant="success" size="lg">
                    {generatedTrip.totalEstimatedCost}
                  </Badge>
                </div>

                <p className="text-text-primary leading-relaxed mb-6">
                  {generatedTrip.summary}
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="font-medium text-text-primary mb-3">Trip Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedTrip.highlights.map((highlight, i) => (
                      <Badge key={i} variant="default">{highlight}</Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={handleSave} className="flex-1">
                    Save This Trip
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                    Create Another
                  </Button>
                </div>
              </Card>

              {/* Day by Day Itinerary */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-text-primary">Your Itinerary</h3>
                {generatedTrip.itinerary.map((day, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent font-medium">{day.day}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-text-primary">{day.title}</h4>
                    </div>
                    
                    <div className="ml-13 pl-7 border-l-2 border-border space-y-4">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="relative">
                          <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-accent/30 border-2 border-accent" />
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-text-primary">{activity.name}</h5>
                              <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-text-tertiary">
                                <span>{activity.duration}</span>
                                <span>•</span>
                                <span>{activity.cost}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
