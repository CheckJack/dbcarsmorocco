'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getVehicles, getLocations } from '@/lib/api';
import FeaturedCarCard from '@/components/FeaturedCarCard';
import ReviewCarousel from '@/components/ReviewCarousel';

export default function HomePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);

  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const reviewsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-50px' });
  const featuredInView = useInView(featuredRef, { once: true, margin: '-100px' });
  const reviewsInView = useInView(reviewsRef, { once: true, margin: '-50px' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, locationsData] = await Promise.all([
        getVehicles({}),
        getLocations(),
      ]);
      setVehicles(vehiclesData.slice(0, 6)); // Get first 6 vehicles for featured
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set('location', pickupLocation);
    if (pickupDate) params.set('available_from', pickupDate.toISOString().split('T')[0]);
    if (dropoffDate) params.set('available_to', dropoffDate.toISOString().split('T')[0]);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/herocars.jpg"
            alt="Luxury Cars"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Experience Luxury
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Premium Car Rental Service
            </p>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-form-container max-w-4xl mx-auto"
          >
            <div className="glass-form-box p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Pickup Location
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} - {loc.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup Date */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Pickup Date
                  </label>
                  <DatePicker
                    selected={pickupDate}
                    onChange={(date: Date | null) => setPickupDate(date)}
                    minDate={new Date()}
                    placeholderText="Select date"
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>

                {/* Dropoff Date */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Dropoff Date
                  </label>
                  <DatePicker
                    selected={dropoffDate}
                    onChange={(date: Date | null) => setDropoffDate(date)}
                    minDate={pickupDate || new Date()}
                    placeholderText="Select date"
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Search Available Cars
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section
        ref={featuredRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-white/70 text-lg">
              Discover our premium collection
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-white py-20">Loading...</div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FeaturedCarCard vehicle={vehicle} priority={index < 3} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-20">
              No vehicles available at the moment
            </div>
          )}

          {vehicles.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/cars"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                View All Vehicles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section
        ref={reviewsRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-black"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={reviewsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-white/70 text-lg">
              Trusted by thousands of satisfied customers
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={reviewsInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ReviewCarousel visibleCards={3} autoPlay={true} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
