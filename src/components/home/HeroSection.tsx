'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Users, MapPin, Wrench } from 'lucide-react';
import Link from 'next/link';

const heroImages = [
  'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg',
  'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg',
  'https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg',
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bb-gradient opacity-80" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bb-text-gradient">Bangalore Bikes</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            Your ultimate destination for Royal Enfield maintenance, epic rides, and a thriving motorcycle community in the Silicon Valley of India.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bb-gold-gradient text-white hover:opacity-90 transition-opacity text-lg px-8 py-4"
              asChild
            >
              <Link href="/rides">
                Explore Rides <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[var(--bb-navy)] text-lg px-8 py-4"
              asChild
            >
              <Link href="/maintenance">
                <Play className="mr-2 h-5 w-5" />
                Learn Maintenance
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-[var(--bb-gold)]" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-gray-300">Community Members</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-8 w-8 text-[var(--bb-gold)]" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-gray-300">Destinations Covered</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Wrench className="h-8 w-8 text-[var(--bb-gold)]" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-gray-300">Maintenance Guides</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}