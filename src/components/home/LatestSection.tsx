import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const latestRides = [
  {
    title: 'Nandi Hills Sunrise Ride',
    date: '2024-01-15',
    meetingPoint: 'Hebbal Flyover',
    participants: 25,
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg',
    status: 'upcoming',
  },
  {
    title: 'Coorg Coffee Trail',
    date: '2024-01-22',
    meetingPoint: 'Electronic City',
    participants: 18,
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg',
    status: 'upcoming',
  },
];

const latestBlogs = [
  {
    title: 'Essential Tools Every Royal Enfield Owner Should Have',
    excerpt: 'A comprehensive guide to building your motorcycle toolkit for basic maintenance and emergency repairs.',
    date: '2024-01-10',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  },
  {
    title: 'Best Routes Around Bangalore for Weekend Rides',
    excerpt: 'Discover scenic routes perfect for day trips from Bangalore, complete with fuel stops and photo spots.',
    date: '2024-01-08',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg',
  },
];

export default function LatestSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upcoming Rides */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-2">
                Upcoming Rides
              </h2>
              <p className="text-gray-600">Join our next adventure</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/rides">
                View All Rides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestRides.map((ride, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${ride.image})` }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[var(--bb-gold)] text-white">
                      {ride.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {ride.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(ride.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Meeting Point: {ride.meetingPoint}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {ride.participants} riders registered
                    </div>
                  </div>
                  <Button className="w-full bb-gold-gradient text-white">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Latest Blog Posts */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-2">
                Latest from Blog
              </h2>
              <p className="text-gray-600">Tips, stories, and insights from the community</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blogs">
                View All Posts <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestBlogs.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.readTime}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-[var(--bb-navy)] leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                  <Button variant="outline" className="hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}