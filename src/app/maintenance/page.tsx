import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, MapPin, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const maintenanceCategories = [
  {
    title: 'Basic Checks',
    description: 'Daily and weekly maintenance routines',
    guides: ['Engine Oil Check', 'Tire Pressure', 'Chain Tension', 'Brake Fluid'],
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  },
  {
    title: 'Periodic Maintenance',
    description: 'Monthly and seasonal maintenance tasks',
    guides: ['Oil Change', 'Air Filter Cleaning', 'Spark Plug Replacement', 'Chain Lubrication'],
    image: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg',
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues and their solutions',
    guides: ['Starting Problems', 'Engine Noise', 'Electrical Issues', 'Carburetor Tuning'],
    image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
  },
];

export default function MaintenancePage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Knowledge & Maintenance Hub
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Everything you need to keep your Royal Enfield running smoothly. From DIY guides to professional support.
            </p>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* DIY Maintenance */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 mx-auto">
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-[var(--bb-navy)]">
                  DIY Self-Maintenance
                </CardTitle>
                <CardDescription>
                  Learn to maintain your bike with our step-by-step guides
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bb-gold-gradient text-white mb-4">
                  Explore Guides
                </Button>
                <p className="text-sm text-gray-600">
                  50+ detailed maintenance tutorials
                </p>
              </CardContent>
            </Card>

            {/* Trusted Garages */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 mx-auto">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-[var(--bb-navy)]">
                  Trusted Garages
                </CardTitle>
                <CardDescription>
                  Vetted service centers across Bangalore
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bb-gold-gradient text-white mb-4" asChild>
                  <Link href="/maintenance/garages">
                    Find Garages
                  </Link>
                </Button>
                <p className="text-sm text-gray-600">
                  25+ verified service centers
                </p>
              </CardContent>
            </Card>

            {/* SOS/RSA */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4 mx-auto">
                  <Phone className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-[var(--bb-navy)]">
                  SOS & Roadside Assistance
                </CardTitle>
                <CardDescription>
                  24/7 emergency support when you need it
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bb-gold-gradient text-white mb-4" asChild>
                  <Link href="/maintenance/sos">
                    Emergency Contacts
                  </Link>
                </Button>
                <p className="text-sm text-gray-600">
                  Available 24/7 across Karnataka
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* DIY Maintenance Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              DIY Maintenance Categories
            </h2>
            <p className="text-xl text-gray-600">
              Master your Royal Enfield maintenance with our comprehensive guides
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {maintenanceCategories.map((category, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {category.guides.map((guide, guideIndex) => (
                      <li key={guideIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {guide}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]">
                    View Guides <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}