import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, MapPin, Heart, Users, Camera, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tripAPI } from '../api/api.js';
import { Button, Card } from '../components/ui/index.js';

// Trending destinations with Unsplash IDs
const trendingDestinations = [
  { id: '1512343879784-a960bf40e7f2', name: 'Goa', country: 'India' },
  { id: '1506905925346-21bda4d32df4', name: 'Manali', country: 'India' },
  { id: '1477587458883-47145ed6a1f4', name: 'Rajasthan', country: 'India' },
  { id: '1602216056096-3b40cc0c9944', name: 'Kerala', country: 'India' },
  { id: '1506197603052-3cc9c3a201bd', name: 'Ladakh', country: 'India' },
  { id: '1537996194471-e657df975ab4', name: 'Bali', country: 'Indonesia' },
];

const features = [
  {
    icon: Compass,
    title: 'AI Trip Planning',
    description: 'Generate personalized itineraries powered by advanced AI that understands your travel style'
  },
  {
    icon: Camera,
    title: 'Place Scanner',
    description: 'Point your camera at any landmark and instantly get detailed travel information'
  },
  {
    icon: Heart,
    title: 'Travel Stories',
    description: 'Share your journeys and discover authentic experiences from fellow travelers'
  },
  {
    icon: Users,
    title: 'Smart Budgeting',
    description: 'Get accurate cost estimates and budget recommendations for every destination'
  }
];

export default function Home() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await tripAPI.getTrending();
        setTrending(response.data.data);
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80"
            alt="Travel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-6">
                ✨ AI-Powered Travel Planning
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-text-primary mb-6 leading-tight"
            >
              Your Next Adventure,{' '}
              <span className="italic text-accent">Planned by AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-text-secondary mb-8 max-w-xl"
            >
              Generate personalized day-by-day itineraries, discover hidden gems, 
              and scan any place with your camera for instant travel insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/plan">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Plan a Trip
                </Button>
              </Link>
              <Link to="/scan">
                <Button variant="secondary" size="lg" leftIcon={<Camera className="w-5 h-5" />}>
                  Scan a Place
                </Button>
              </Link>
              <Link to="/stories">
                <Button variant="ghost" size="lg">
                  Explore Stories
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-semibold text-text-primary mb-4">
            Why Choose <span className="italic">Musafir</span>?
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Experience the future of travel planning with our intelligent features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full" hover>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="font-display text-4xl font-semibold text-text-primary mb-2">
                Trending Destinations
              </h2>
              <p className="text-text-secondary">Popular places travelers are exploring now</p>
            </div>
            <Link to="/plan" className="hidden sm:block">
              <Button variant="ghost">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {trendingDestinations.map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${dest.id}?w=600&q=80`}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-text-primary">{dest.name}</h3>
                    <p className="text-sm text-text-secondary">{dest.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-text-primary mb-6">
              Ready to Start Your <span className="italic text-accent">Journey</span>?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
              Plan your perfect trip with AI-powered itineraries in minutes. 
              No more hours of research — just tell us your preferences and let our AI do the rest.
            </p>
            <Link to="/plan">
              <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Planning Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
