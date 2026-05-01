import { motion } from 'framer-motion';
import { Sun, Utensils, Moon, MapPin, Download, Save } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { tripAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ItineraryCard({ tripData, onSave }) {
  const { user, isAuthenticated } = useAuth();
  const { itinerary, destination, days, budget, estimatedCost } = tripData;

  const handleExportPDF = async () => {
    const result = await exportToPDF('itinerary-content', `${destination}-itinerary.pdf`);
    if (result.success) {
      toast.success('Itinerary downloaded!');
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save trips');
      return;
    }

    try {
      await tripAPI.save({
        ...tripData,
        userId: user.id
      });
      toast.success('Trip saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      toast.error('Failed to save trip');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-primary-500" />
            <span>{destination}</span>
          </h2>
          <p className="text-gray-600 mt-1">{days} Days • {budget.charAt(0).toUpperCase() + budget.slice(1)} Budget</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Estimated Cost</p>
          <p className="text-2xl font-bold text-primary-600">₹{estimatedCost?.toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
        <button
          onClick={handleSaveTrip}
          className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Trip</span>
        </button>
      </div>

      {/* Itinerary Content */}
      <div id="itinerary-content" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {itinerary.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-5 border border-orange-100"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                {day.day}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Day {day.day}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sun className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Morning</p>
                  <p className="text-gray-700">{day.morning}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Afternoon</p>
                  <p className="text-gray-700">{day.afternoon}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Moon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Evening</p>
                  <p className="text-gray-700">{day.evening}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
