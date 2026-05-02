import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, Upload, X, MapPin, Clock, DollarSign, Star, 
  Info, Loader2, ArrowRight, ScanLine, Compass, Smartphone
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui/index.js';
import { placesAPI } from '../api/api.js';

export default function PlaceScanner() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage); // 'image' must match multer field name

      // CRITICAL: Do NOT set Content-Type header — let browser set it with boundary
      const response = await placesAPI.identify(formData);
      setResult(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to scan image');
    } finally {
      setIsScanning(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  // Handle camera capture for mobile devices
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <ScanLine className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-text-primary mb-4">
            Place <span className="italic text-accent">Scanner</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Upload a photo of any landmark, monument, or tourist attraction and our AI 
            will identify it and provide you with detailed travel information.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Upload an Image
              </h2>
              
              {!preview ? (
                <div className="space-y-4">
                  {/* Drag & Drop Area */}
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragActive 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border hover:border-accent/50 hover:bg-surface-2'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-7 h-7 text-accent" />
                    </div>
                    <p className="text-text-primary font-medium mb-1">
                      {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
                    </p>
                    <p className="text-text-secondary text-sm mb-2">
                      or click to browse your files
                    </p>
                    <p className="text-text-tertiary text-xs">
                      Supports: JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>

                  {/* Mobile Camera Capture Button */}
                  {isMobile() && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="camera-input"
                      />
                      <label
                        htmlFor="camera-input"
                        className="flex items-center justify-center gap-2 w-full p-4 bg-accent/10 border border-accent/30 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors"
                      >
                        <Smartphone className="w-5 h-5 text-accent" />
                        <span className="text-text-primary font-medium">Take a Photo</span>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-text-primary hover:bg-danger hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {preview && !result && (
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleScan}
                  disabled={isScanning}
                  isLoading={isScanning}
                  leftIcon={<Camera className="w-5 h-5" />}
                >
                  {isScanning ? 'Analyzing Image...' : 'Scan Place'}
                </Button>
              )}

              {error && (
                <div className="mt-4 p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {!result ? (
                <Card className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                    <Compass className="w-10 h-10 text-text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Ready to Scan
                  </h3>
                  <p className="text-text-secondary text-sm max-w-xs">
                    Upload a photo of any landmark or tourist spot and we'll identify it for you
                  </p>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {result.identified ? (
                    <Card className="p-6">
                      {/* Header */}
                      <div className="place-header mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-display font-semibold text-text-primary">
                              {result.placeName}
                            </h2>
                            {result.localName && (
                              <p className="text-text-secondary text-sm mt-1">{result.localName}</p>
                            )}
                            <p className="text-text-secondary flex items-center gap-2 mt-2">
                              <MapPin className="w-4 h-4" />
                              {result.location?.city}, {result.location?.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="success">
                              {result.confidence}% confidence
                            </Badge>
                            <Badge variant="default">{result.placeType}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="tabs flex gap-2 mb-6 border-b border-border pb-2">
                        {['overview', 'practical', 'tips', 'plan'].map(tab => (
                          <button
                            key={tab}
                            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                              activeTab === tab
                                ? 'bg-accent/10 text-accent'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                            onClick={() => setActiveTab(tab)}
                          >
                            {tab === 'overview' && '📖 Overview'}
                            {tab === 'practical' && '🗺️ Practical Info'}
                            {tab === 'tips' && '💡 Insider Tips'}
                            {tab === 'plan' && '✈️ Plan a Trip'}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'overview' && (
                        <div>
                          <p className="text-text-primary leading-relaxed mb-4">{result.overview}</p>
                          <p className="text-text-secondary mb-4">
                            <strong>Historical Significance:</strong> {result.historicalSignificance}
                          </p>
                          <p className="text-text-secondary mb-4">
                            <strong>Why Visit:</strong> {result.whyVisit}
                          </p>
                          <p className="text-text-secondary mb-4">
                            <strong>Best Time:</strong> {result.bestTimeToVisit}
                          </p>
                          <p className="text-text-secondary">
                            <strong>Visit Duration:</strong> {result.estimatedVisitDuration}
                          </p>
                        </div>
                      )}

                      {activeTab === 'practical' && (
                        <div>
                          <p className="text-text-secondary mb-4">
                            <strong>Entry Fee:</strong> {result.entryFee}
                          </p>
                          <p className="text-text-secondary mb-4">
                            <strong>Opening Hours:</strong> {result.openingHours}
                          </p>
                          <p className="text-text-secondary mb-4">
                            <strong>How to Reach:</strong> {result.howToReach}
                          </p>
                          <p className="text-text-secondary mb-4">
                            <strong>Accessibility:</strong> {result.accessibilityInfo}
                          </p>
                          {result.nearbyAttractions && (
                            <div className="mb-4">
                              <strong className="text-text-primary">Nearby Attractions:</strong>
                              <ul className="mt-2 space-y-1">
                                {result.nearbyAttractions.map((p, i) => (
                                  <li key={i} className="text-text-secondary">• {p}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.localCuisine && (
                            <div>
                              <strong className="text-text-primary">Local Cuisine:</strong>
                              <ul className="mt-2 space-y-1">
                                {result.localCuisine.map((d, i) => (
                                  <li key={i} className="text-text-secondary">• {d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'tips' && (
                        <div>
                          <div className="mb-4">
                            <strong className="text-text-primary">Insider Tips:</strong>
                            <ul className="mt-2 space-y-2">
                              {result.insiderTips?.map((t, i) => (
                                <li key={i} className="text-text-secondary">• {t}</li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-text-secondary mb-4">
                            <strong>Photography:</strong> {result.photographySpots}
                          </p>
                          <p className="text-text-secondary">
                            <strong>General Advice:</strong> {result.travelTips}
                          </p>
                        </div>
                      )}

                      {activeTab === 'plan' && (
                        <div>
                          <p className="text-text-primary mb-4">
                            Ready to visit {result.placeName}?
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => window.location.href = `/plan?destination=${result.location?.city}, ${result.location?.country}`}
                          >
                            ✈️ Plan a Trip to {result.location?.city}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                        <Button
                          className="flex-1"
                          onClick={clearImage}
                          variant="secondary"
                        >
                          Scan Another
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6">
                      <p className="text-text-secondary">{result.message}</p>
                      <p className="text-text-secondary mt-2">
                        Suggested searches: {result.suggestedSearchTerms?.join(', ')}
                      </p>
                      <Button className="mt-4" onClick={clearImage}>
                        Try Another Image
                      </Button>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sample Images */}
        {!preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-lg font-medium text-text-primary mb-4 text-center">
              Try scanning these types of images
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { img: '1477587458883-47145ed6a1f4', label: 'Landmarks' },
                { img: '1488085061387-422e29b40080', label: 'Monuments' },
                { img: '1506905925346-21bda4d32df4', label: 'Mountains' },
                { img: '1507525428032-b72ba9ac13b0', label: 'Beaches' },
              ].map((sample) => (
                <div key={sample.label} className="text-center">
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img
                      src={`https://images.unsplash.com/photo-${sample.img}?w=300&q=80`}
                      alt={sample.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-text-secondary">{sample.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
