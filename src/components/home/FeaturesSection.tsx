import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, MapPin, BookOpen, Users, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Wrench,
    title: 'DIY Maintenance',
    description: 'Step-by-step guides for maintaining your Royal Enfield at home.',
    link: '/maintenance',
    color: 'text-blue-600',
  },
  {
    icon: MapPin,
    title: 'Trusted Garages',
    description: 'Curated list of reliable service centers across Bangalore.',
    link: '/maintenance/garages',
    color: 'text-green-600',
  },
  {
    icon: Phone,
    title: 'Roadside Assistance',
    description: '24/7 emergency support when you need it most.',
    link: '/maintenance/sos',
    color: 'text-red-600',
  },
  {
    icon: Calendar,
    title: 'Official Rides',
    description: 'Join organized rides to explore Karnataka\'s scenic routes.',
    link: '/rides',
    color: 'text-purple-600',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Wiki',
    description: 'Comprehensive database of motorcycle knowledge and tips.',
    link: '/wiki',
    color: 'text-indigo-600',
  },
  {
    icon: Users,
    title: 'Community Blog',
    description: 'Stories, experiences, and insights from fellow riders.',
    link: '/blogs',
    color: 'text-orange-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--bb-navy)] mb-4">
            Everything You Need for Your Royal Enfield
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From maintenance guides to epic rides, we've got your motorcycle journey covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-bold text-[var(--bb-navy)]">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="group-hover:bg-[var(--bb-gold)] group-hover:text-white group-hover:border-[var(--bb-gold)] transition-all duration-300"
                  asChild
                >
                  <Link href={feature.link}>
                    Learn More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}