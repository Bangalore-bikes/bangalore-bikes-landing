import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, Clock, Wrench } from 'lucide-react';

const garages = [
  {
    name: 'Royal Enfield Service Center - Koramangala',
    address: '123 Koramangala 4th Block, Bangalore 560034',
    phone: '+91 80 2553 4567',
    rating: 4.8,
    reviews: 156,
    services: ['General Service', 'Engine Repair', 'Electrical Work', 'Spare Parts'],
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    verified: true,
    image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg',
  },
  {
    name: 'Bullet Point Garage',
    address: '456 Indiranagar 100 Feet Road, Bangalore 560038',
    phone: '+91 80 4123 5678',
    rating: 4.6,
    reviews: 89,
    services: ['Custom Modifications', 'Performance Tuning', 'Restoration', 'Maintenance'],
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
    verified: true,
    image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
  },
  {
    name: 'Classic Motors - Jayanagar',
    address: '789 Jayanagar 4th T Block, Bangalore 560041',
    phone: '+91 80 2665 7890',
    rating: 4.5,
    reviews: 124,
    services: ['Vintage Restoration', 'Engine Overhaul', 'Paint Work', 'Accessories'],
    hours: 'Mon-Sat: 9:30 AM - 6:30 PM',
    verified: true,
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  },
  {
    name: 'Enfield Express - Electronic City',
    address: '321 Electronic City Phase 1, Bangalore 560100',
    phone: '+91 80 2783 4567',
    rating: 4.4,
    reviews: 67,
    services: ['Quick Service', 'Oil Change', 'Tire Replacement', 'Basic Repairs'],
    hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
    verified: false,
    image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg',
  },
  {
    name: 'Thunderbird Garage - Whitefield',
    address: '654 Whitefield Main Road, Bangalore 560066',
    phone: '+91 80 2845 6789',
    rating: 4.7,
    reviews: 98,
    services: ['Complete Overhaul', 'Custom Paint', 'Performance Upgrades', 'Diagnostics'],
    hours: 'Tue-Sun: 9:00 AM - 7:00 PM',
    verified: true,
    image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
  },
  {
    name: 'Royal Care Motors - Banashankari',
    address: '987 Banashankari 2nd Stage, Bangalore 560070',
    phone: '+91 80 2661 2345',
    rating: 4.3,
    reviews: 45,
    services: ['Insurance Claims', 'Accident Repair', 'Spare Parts', 'Maintenance'],
    hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    verified: true,
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  },
];

export default function GaragesPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="bb-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Trusted Garages in Bangalore
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Vetted and verified service centers for your Royal Enfield. Quality service you can trust.
            </p>
          </div>
        </div>
      </section>

      {/* Garages Listing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[var(--bb-navy)]">
                {garages.length} Service Centers Found
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  Verified
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                  Unverified
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {garages.map((garage, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex">
                  <div className="relative w-1/3">
                    <div
                      className="w-full h-full bg-cover bg-center min-h-[200px]"
                      style={{ backgroundImage: `url(${garage.image})` }}
                    />
                    {garage.verified && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white text-xs">
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl text-[var(--bb-navy)] leading-tight">
                          {garage.name}
                        </CardTitle>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{garage.rating}</span>
                          <span className="text-gray-500">({garage.reviews})</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{garage.address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{garage.phone}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{garage.hours}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-1 mb-2">
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Services:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {garage.services.map((service, serviceIndex) => (
                            <Badge key={serviceIndex} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bb-gold-gradient text-white">
                          Call Now
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}