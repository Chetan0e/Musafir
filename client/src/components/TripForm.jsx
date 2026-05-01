import { useState } from 'react';
import { motion } from 'framer-motion';
import { tripAPI } from '../api/api';
import { MapPin, Calendar, DollarSign, Users, Heart, Sparkles } from 'lucide-react';

export default function TripForm({ onTripGenerated }) {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'medium',
    travelType: 'solo',
    interests: []
  });
  const [loading, setLoading] = useState(false);

  const interests = [
    'Adventure', 'Food', 'Nature', 'Nightlife', 
    'Culture', 'Shopping', 'Relaxation', 'History'
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;

    setLoading(true);
    try {
      const response = await tripAPI.generate(formData);
      onTripGenerated(response.data.data);
    } catch (error) {
      console.error('Error generating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card"
    >
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Plan Your Trip</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span>Destination</span>
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="Where do you want to go?"
            className="input-field"
            required
          />
        </div>

        {/* Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>Number of Days</span>
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
            className="input-field"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-primary-500" />
            <span>Budget</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => setFormData({ ...formData, budget })}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.budget === budget
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {budget.charAt(0).toUpperCase() + budget.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary-500" />
            <span>Travel Type</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['solo', 'friends', 'family'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, travelType: type })}
                className={`py-3 px-4 rounded-xl font-medium transition-all capitalize ${
                  formData.travelType === type
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <Heart className="w-4 h-4 text-primary-500" />
            <span>Interests (Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.interests.includes(interest)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.destination}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Itinerary</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
