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
      const response = await placesAPI.identify(selectedImage);
      setResult(response.data.data.place);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to identify place. Please try again.');
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
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="success" className="mb-2">
                          {Math.round(result.confidence * 100)}% Match
                        </Badge>
                        <h2 className="text-2xl font-display font-semibold text-text-primary">
                          {result.name}
                        </h2>
                        <p className="text-text-secondary flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {result.location}
                        </p>
                      </div>
                      {result.rating && (
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="font-medium">{result.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-text-primary leading-relaxed mb-6">
                      {result.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-surface-2 rounded-lg text-center">
                        <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
                        <p className="text-sm text-text-secondary">Best Time</p>
                        <p className="font-medium text-text-primary">{result.bestTimeToVisit}</p>
                      </div>
                      <div className="p-3 bg-surface-2 rounded-lg text-center">
                        <DollarSign className="w-5 h-5 text-accent mx-auto mb-1" />
                        <p className="text-sm text-text-secondary">Entry Fee</p>
                        <p className="font-medium text-text-primary">{result.entryFee}</p>
                      </div>
                      <div className="p-3 bg-surface-2 rounded-lg text-center">
                        <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
                        <p className="text-sm text-text-secondary">Duration</p>
                        <p className="font-medium text-text-primary">{result.recommendedDuration}</p>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Key Highlights
                      </h3>
                      <ul className="space-y-2">
                        {result.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                      <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-accent" />
                        Travel Tips
                      </h3>
                      <ul className="space-y-2">
                        {result.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nearby Attractions */}
                    {result.nearbyAttractions && result.nearbyAttractions.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium text-text-primary mb-3">
                          Nearby Attractions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.nearbyAttractions.map((attraction, i) => (
                            <Badge key={i} variant="ghost">{attraction}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button 
                        className="flex-1" 
                        onClick={clearImage}
                        variant="secondary"
                      >
                        Scan Another
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => {/* TODO: Plan trip to this location */}}
                      >
                        Plan Trip Here
                      </Button>
                    </div>
                  </Card>
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
