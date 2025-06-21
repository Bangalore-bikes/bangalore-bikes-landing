import Footer from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, ExternalLink } from "lucide-react";

const blogPosts = [
  {
    title: "Essential Tools Every Royal Enfield Owner Should Have",
    excerpt:
      "A comprehensive guide to building your motorcycle toolkit for basic maintenance and emergency repairs on the road.",
    author: "Rajesh Kumar",
    date: "2024-01-10",
    readTime: "5 min read",
    category: "Maintenance",
    image:
      "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg",
    featured: true,
  },
  {
    title: "Best Routes Around Bangalore for Weekend Rides",
    excerpt:
      "Discover scenic routes perfect for day trips from Bangalore, complete with fuel stops, food recommendations, and photo spots.",
    author: "Priya Sharma",
    date: "2024-01-08",
    readTime: "8 min read",
    category: "Routes",
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
    featured: true,
  },
  {
    title: "Royal Enfield Classic 350 vs Bullet 350: Which One to Choose?",
    excerpt:
      "An in-depth comparison of two iconic Royal Enfield models to help you make the right choice for your riding style.",
    author: "Arjun Reddy",
    date: "2024-01-05",
    readTime: "6 min read",
    category: "Reviews",
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
    featured: false,
  },
  {
    title: "Monsoon Riding Tips for Royal Enfield Owners",
    excerpt:
      "Stay safe and enjoy riding during the monsoon season with these essential tips and precautions.",
    author: "Kavya Nair",
    date: "2024-01-03",
    readTime: "4 min read",
    category: "Safety",
    image: "https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg",
    featured: false,
  },
  {
    title: "Customizing Your Royal Enfield: Legal Modifications Guide",
    excerpt:
      "Learn about legal modifications you can make to personalize your Royal Enfield while staying compliant with regulations.",
    author: "Vikram Singh",
    date: "2024-01-01",
    readTime: "7 min read",
    category: "Customization",
    image: "https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg",
    featured: false,
  },
  {
    title: "Planning Your First Long-Distance Ride: A Beginner's Guide",
    excerpt:
      "Everything you need to know before embarking on your first multi-day motorcycle adventure.",
    author: "Anita Desai",
    date: "2023-12-28",
    readTime: "10 min read",
    category: "Travel",
    image: "https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg",
    featured: false,
  },
];

const categories = [
  "All",
  "Maintenance",
  "Routes",
  "Reviews",
  "Safety",
  "Customization",
  "Travel",
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Maintenance: "bg-blue-100 text-blue-800",
    Routes: "bg-green-100 text-green-800",
    Reviews: "bg-purple-100 text-purple-800",
    Safety: "bg-red-100 text-red-800",
    Customization: "bg-orange-100 text-orange-800",
    Travel: "bg-indigo-100 text-indigo-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

export default function BlogsPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <main>
      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Community Blog
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Stories, experiences, and insights from fellow Royal Enfield
              riders. Learn, share, and connect with the community.
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              <span>Powered by Notion via embednotion.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Featured Articles
            </h2>
            <p className="text-xl text-gray-600">
              Must-read content from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featuredPosts.map((post, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[var(--bb-gold)] text-white">
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--bb-navy)] leading-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
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

      {/* All Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              All Articles
            </h2>
            <p className="text-xl text-gray-600">
              Browse our complete collection of articles
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={
                  category === "All"
                    ? "bb-gold-gradient text-white"
                    : "hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-[var(--bb-navy)] leading-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notion Integration Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h3 className="font-display text-2xl font-bold text-[var(--bb-navy)] mb-4">
              Want to Contribute?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our blog is powered by Notion and embedded using embednotion.com.
              Community members can contribute articles about their riding
              experiences, maintenance tips, and travel stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bb-gold-gradient text-white">
                Submit Your Story
              </Button>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit blog.bangalorebikes.com
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
