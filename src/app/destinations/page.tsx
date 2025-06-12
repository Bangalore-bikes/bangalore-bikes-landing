"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Clock, Star, Filter, Search, ArrowRight } from "lucide-react";

// Mock data - in real app, this would come from CSV
const destinations = [
  {
    name: "Nandi Hills",
    location: "Chikkaballapur",
    distance: "65 km",
    duration: "1.5 hours",
    difficulty: "Easy",
    rating: 4.8,
    reviews: 156,
    type: "Hill Station",
    bestTime: "Oct-Mar",
    description:
      "Famous for sunrise views and pleasant weather. Perfect for beginners.",
    highlights: [
      "Sunrise Point",
      "Tipu's Drop",
      "Ancient Temple",
      "Paragliding",
    ],
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
    popular: true,
  },
  {
    name: "Coorg (Madikeri)",
    location: "Kodagu",
    distance: "280 km",
    duration: "5 hours",
    difficulty: "Moderate",
    rating: 4.9,
    reviews: 203,
    type: "Hill Station",
    bestTime: "Oct-May",
    description: "Coffee plantations, misty hills, and beautiful waterfalls.",
    highlights: [
      "Coffee Estates",
      "Abbey Falls",
      "Raja's Seat",
      "Dubare Elephant Camp",
    ],
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
    popular: true,
  },
  {
    name: "Hampi",
    location: "Ballari",
    distance: "350 km",
    duration: "6 hours",
    difficulty: "Challenging",
    rating: 4.7,
    reviews: 189,
    type: "Heritage",
    bestTime: "Nov-Feb",
    description: "UNESCO World Heritage Site with ancient ruins and temples.",
    highlights: [
      "Virupaksha Temple",
      "Stone Chariot",
      "Coracle Ride",
      "Sunset Point",
    ],
    image: "https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg",
    popular: true,
  },
  {
    name: "Chikmagalur",
    location: "Chikmagalur",
    distance: "245 km",
    duration: "4.5 hours",
    difficulty: "Moderate",
    rating: 4.6,
    reviews: 142,
    type: "Hill Station",
    bestTime: "Sep-May",
    description: "Coffee country with lush green hills and pleasant climate.",
    highlights: [
      "Mullayanagiri Peak",
      "Baba Budangiri",
      "Coffee Plantations",
      "Hebbe Falls",
    ],
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
    popular: false,
  },
  {
    name: "Mysore",
    location: "Mysuru",
    distance: "150 km",
    duration: "3 hours",
    difficulty: "Easy",
    rating: 4.5,
    reviews: 178,
    type: "Heritage",
    bestTime: "Oct-Mar",
    description: "City of palaces with rich cultural heritage.",
    highlights: [
      "Mysore Palace",
      "Chamundi Hills",
      "Brindavan Gardens",
      "St. Philomena's Church",
    ],
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
    popular: false,
  },
  {
    name: "Gokarna",
    location: "Uttara Kannada",
    distance: "485 km",
    duration: "8 hours",
    difficulty: "Challenging",
    rating: 4.4,
    reviews: 98,
    type: "Beach",
    bestTime: "Oct-Mar",
    description: "Pristine beaches and ancient temples by the Arabian Sea.",
    highlights: [
      "Om Beach",
      "Kudle Beach",
      "Mahabaleshwar Temple",
      "Paradise Beach",
    ],
    image: "https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg",
    popular: false,
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800";
    case "moderate":
      return "bg-yellow-100 text-yellow-800";
    case "challenging":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      destination.type.toLowerCase() === filterType.toLowerCase();
    const matchesDifficulty =
      filterDifficulty === "all" ||
      destination.difficulty.toLowerCase() === filterDifficulty.toLowerCase();

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const popularDestinations = destinations.filter((dest) => dest.popular);

  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Discover Amazing Destinations
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Explore Karnataka's most scenic routes and hidden gems. From hill
              stations to heritage sites.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Most loved destinations by our riding community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {popularDestinations.map((destination, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${destination.image})` }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[var(--bb-gold)] text-white">
                      Popular
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold">
                        {destination.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-[var(--bb-navy)]">
                      {destination.name}
                    </CardTitle>
                    <Badge
                      className={getDifficultyColor(destination.difficulty)}
                    >
                      {destination.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.location} • {destination.distance} •{" "}
                    {destination.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {destination.description}
                  </p>
                  <Button className="w-full bb-gold-gradient text-white">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              All Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Find your perfect riding destination
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hill station">Hill Station</SelectItem>
                    <SelectItem value="heritage">Heritage</SelectItem>
                    <SelectItem value="beach">Beach</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterDifficulty}
                  onValueChange={setFilterDifficulty}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredDestinations.length} of {destinations.length}{" "}
              destinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDestinations.map((destination, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div
                      className="h-48 md:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${destination.image})` }}
                    />
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-xl font-bold text-[var(--bb-navy)]">
                        {destination.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">
                          {destination.rating}
                        </span>
                        <span className="text-gray-500">
                          ({destination.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{destination.location}</span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">{destination.distance}</span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">{destination.duration}</span>
                    </div>

                    <div className="flex space-x-2 mb-3">
                      <Badge variant="secondary">{destination.type}</Badge>
                      <Badge
                        className={getDifficultyColor(destination.difficulty)}
                      >
                        {destination.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {destination.bestTime}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {destination.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {destination.highlights
                          .slice(0, 3)
                          .map((highlight, highlightIndex) => (
                            <Badge
                              key={highlightIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        {destination.highlights.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{destination.highlights.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                    >
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No destinations found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterDifficulty("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
