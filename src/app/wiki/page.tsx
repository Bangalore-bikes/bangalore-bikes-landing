import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Book, Search, Truck, Wrench, MapPin, Users, ArrowRight, ExternalLink } from 'lucide-react';

const wikiCategories = [
  {
    title: 'Maintenance & Repair',
    icon: Wrench,
    description: 'Complete guides for Royal Enfield maintenance',
    articles: 45,
    topics: ['Engine Care', 'Electrical Systems', 'Carburetor Tuning', 'Brake Maintenance'],
    color: 'bg-blue-100 text-blue-800',
  },
  {
    title: 'Parts & Accessories',
    icon: Book,
    description: 'Everything about Royal Enfield parts and upgrades',
    articles: 32,
    topics: ['Genuine Parts', 'Aftermarket Options', 'Performance Upgrades', 'Compatibility Guide'],
    color: 'bg-green-100 text-green-800',
  },
  {
    title: 'Shipping & Logistics',
    icon: Truck,
    description: 'Comprehensive shipping information for parts and accessories',
    articles: 18,
    topics: ['Shipping Rates', 'Delivery Times', 'International Shipping', 'Return Policy'],
    color: 'bg-orange-100 text-orange-800',
    featured: true,
  },
  {
    title: 'Riding Locations',
    icon: MapPin,
    description: 'Detailed information about riding destinations',
    articles: 28,
    topics: ['Route Guides', 'Fuel Stops', 'Accommodation', 'Local Regulations'],
    color: 'bg-purple-100 text-purple-800',
  },
  {
    title: 'Community Guidelines',
    icon: Users,
    description: 'Rules, etiquette, and community standards',
    articles: 12,
    topics: ['Group Riding Rules', 'Safety Guidelines', 'Event Protocols', 'Forum Etiquette'],
    color: 'bg-indigo-100 text-indigo-800',
  },
];

const featuredArticles = [
  {
    title: 'Complete Royal Enfield Shipping Guide 2024',
    category: 'Shipping',
    description: 'Everything you need to know about shipping Royal Enfield parts, accessories, and motorcycles across India and internationally.',
    readTime: '12 min read',
    lastUpdated: '2024-01-10',
    views: 1250,
    featured: true,
  },
  {
    title: 'Royal Enfield Classic 350 Complete Service Manual',
    category: 'Maintenance',
    description: 'Step-by-step service procedures, torque specifications, and maintenance schedules for the Classic 350.',
    readTime: '25 min read',
    lastUpdated: '2024-01-08',
    views: 2100,
    featured: true,
  },
  {
    title: 'Best Routes from Bangalore: Complete Guide',
    category: 'Routes',
    description: 'Comprehensive guide to the best motorcycle routes from Bangalore, including fuel stops, food recommendations, and accommodation.',
    readTime: '18 min read',
    lastUpdated: '2024-01-05',
    views: 1800,
    featured: true,
  },
];

const recentUpdates = [
  {
    title: 'Updated Shipping Rates for 2024',
    category: 'Shipping',
    date: '2024-01-12',
    type: 'Updated',
  },
  {
    title: 'New Royal Enfield Meteor 350 Parts Guide',
    category: 'Parts',
    date: '2024-01-10',
    type: 'New',
  },
  {
    title: 'Revised Group Riding Safety Guidelines',
    category: 'Community',
    date: '2024-01-08',
    type: 'Updated',
  },
];

export default function WikiPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Knowledge Wiki
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Your comprehensive resource for Royal Enfield knowledge. From maintenance guides to shipping information.
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm mb-8">
              <ExternalLink className="h-4 w-4" />
              <span>Content sourced from Reddit community discussions</span>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search the wiki..."
                  className="pl-12 py-4 text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Featured Articles
            </h2>
            <p className="text-xl text-gray-600">
              Most popular and comprehensive guides
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-[var(--bb-gold)] text-white">
                      Featured
                    </Badge>
                    <Badge variant="secondary">
                      {article.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-[var(--bb-navy)] leading-tight">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{article.readTime}</span>
                    <span>{article.views} views</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                  </div>
                  <Button className="w-full bb-gold-gradient text-white">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wiki Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Organized knowledge for easy navigation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wikiCategories.map((category, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow duration-300 ${category.featured ? 'ring-2 ring-[var(--bb-gold)] ring-opacity-50' : ''}`}>
                <CardHeader className="text-center">
                  {category.featured && (
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[var(--bb-gold)] text-white text-xs font-semibold mb-2">
                      FEATURED SECTION
                    </div>
                  )}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${category.color} mb-4 mx-auto`}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-[var(--bb-gold)]">{category.articles}</span>
                    <span className="text-gray-600 ml-1">articles</span>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Popular Topics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {category.topics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className={`w-full ${category.featured ? 'bb-gold-gradient text-white border-[var(--bb-gold)]' : 'hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]'}`}
                  >
                    Browse Articles <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Details Highlight */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-200">
                  <Truck className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[var(--bb-navy)] mb-2">
                    Shipping Details & Information
                  </h3>
                  <p className="text-gray-600 max-w-2xl">
                    Comprehensive shipping information for Royal Enfield parts, accessories, and motorcycles. 
                    Including rates, delivery times, packaging guidelines, and international shipping options.
                  </p>
                </div>
              </div>
              <Button className="bb-gold-gradient text-white">
                View Shipping Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-2">
                Recent Updates
              </h2>
              <p className="text-gray-600">Latest additions and updates to the wiki</p>
            </div>
            <Button variant="outline">
              View All Updates <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUpdates.map((update, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      className={update.type === 'New' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {update.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                    {update.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Category: {update.category}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Changes
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