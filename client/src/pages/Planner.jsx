import { useState } from 'react';
import { motion } from 'framer-motion';
import TripForm from '../components/TripForm';
import ItineraryCard from '../components/ItineraryCard';
import RouteMap from '../components/RouteMap';
import { Sparkles } from 'lucide-react';

export default function Planner() {
  const [tripData, setTripData] = useState(null);

  const handleTripGenerated = (data) => {
    setTripData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Trip Planner</h1>
          </div>
          <p className="text-gray-600 text-lg">Plan your perfect trip with AI-powered itineraries</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Form */}
          <div>
            <TripForm onTripGenerated={handleTripGenerated} />
          </div>

          {/* Right - Itinerary */}
          <div>
            {tripData ? (
              <>
                <ItineraryCard tripData={tripData} />
                <div className="mt-6 card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Location Map</h3>
                  <RouteMap destination={tripData.destination} />
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card flex flex-col items-center justify-center min-h-[500px] text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Itinerary Awaits</h3>
                <p className="text-gray-600 max-w-md">
                  Fill in the trip details on the left to generate a personalized AI-powered itinerary for your journey.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
