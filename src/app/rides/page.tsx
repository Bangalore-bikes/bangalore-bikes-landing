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
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Camera,
  Fuel,
  ArrowRight,
} from "lucide-react";

const upcomingRides = [
  {
    title: "Nandi Hills Sunrise Ride",
    date: "2024-01-15",
    time: "5:00 AM",
    meetingPoint: "Hebbal Flyover",
    destination: "Nandi Hills",
    distance: "65 km",
    duration: "4 hours",
    difficulty: "Easy",
    participants: 25,
    maxParticipants: 30,
    description:
      "Experience the breathtaking sunrise from Nandi Hills. Perfect for beginners and photography enthusiasts.",
    highlights: [
      "Sunrise Photography",
      "Breakfast at Hills",
      "Group Photos",
      "Easy Terrain",
    ],
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
    status: "open",
  },
  {
    title: "Coorg Coffee Trail Weekend",
    date: "2024-01-22",
    time: "6:00 AM",
    meetingPoint: "Electronic City Toll Plaza",
    destination: "Coorg (Madikeri)",
    distance: "280 km",
    duration: "2 days",
    difficulty: "Moderate",
    participants: 18,
    maxParticipants: 20,
    description:
      "Two-day adventure through coffee plantations and misty hills of Coorg. Includes overnight stay.",
    highlights: [
      "Coffee Plantation Tour",
      "Waterfall Visit",
      "Local Cuisine",
      "Overnight Stay",
    ],
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
    status: "filling-fast",
  },
  {
    title: "Hampi Heritage Expedition",
    date: "2024-02-05",
    time: "5:30 AM",
    meetingPoint: "Tumkur Road Toll Plaza",
    destination: "Hampi",
    distance: "350 km",
    duration: "3 days",
    difficulty: "Challenging",
    participants: 12,
    maxParticipants: 15,
    description:
      "Explore the ancient ruins of Hampi on this multi-day adventure. For experienced riders only.",
    highlights: [
      "UNESCO World Heritage Site",
      "Ancient Temples",
      "Coracle Ride",
      "Camping Experience",
    ],
    image: "https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg",
    status: "open",
  },
];

const pastRides = [
  {
    title: "Chikmagalur Coffee Circuit",
    date: "2024-01-08",
    participants: 22,
    images: 12,
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
  },
  {
    title: "Mysore Palace Night Ride",
    date: "2024-01-01",
    participants: 35,
    images: 28,
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800";
    case "filling-fast":
      return "bg-orange-100 text-orange-800";
    case "full":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RidesPage() {
  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Official Rides & Adventures
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Join our organized rides to explore Karnataka's most scenic
              routes. From sunrise rides to multi-day expeditions.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--bb-gold)]">
                  50+
                </div>
                <div>Rides Organized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--bb-gold)]">
                  500+
                </div>
                <div>Happy Riders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--bb-gold)]">
                  25+
                </div>
                <div>Destinations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Rides */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Upcoming Rides
            </h2>
            <p className="text-xl text-gray-600">
              Register now for these amazing adventures
            </p>
          </div>

          <div className="space-y-8">
            {upcomingRides.map((ride, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div
                      className="h-64 md:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${ride.image})` }}
                    />
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-[var(--bb-navy)] mb-2">
                          {ride.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{ride.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getDifficultyColor(ride.difficulty)}>
                          {ride.difficulty}
                        </Badge>
                        <Badge className={getStatusColor(ride.status)}>
                          {ride.status === "filling-fast"
                            ? "Filling Fast"
                            : ride.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-semibold">
                            {new Date(ride.date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">{ride.time}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-semibold">{ride.distance}</div>
                          <div className="text-gray-500">Distance</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-semibold">{ride.duration}</div>
                          <div className="text-gray-500">Duration</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-semibold">
                            {ride.participants}/{ride.maxParticipants}
                          </div>
                          <div className="text-gray-500">Riders</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Meeting Point:
                        </span>
                        <span className="text-sm text-gray-600">
                          {ride.meetingPoint}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Highlights:</span>
                        <div className="flex flex-wrap gap-1">
                          {ride.highlights.map((highlight, highlightIndex) => (
                            <Badge
                              key={highlightIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button className="bb-gold-gradient text-white flex-1">
                        Register Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Past Rides Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Past Adventures
            </h2>
            <p className="text-xl text-gray-600">
              Memories from our recent rides
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pastRides.map((ride, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${ride.image})` }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      View Gallery ({ride.images} photos)
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {ride.title}
                  </CardTitle>
                  <CardDescription>
                    {new Date(ride.date).toLocaleDateString()} •{" "}
                    {ride.participants} riders participated
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ride Guidelines */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Ride Guidelines
            </h2>
            <p className="text-xl text-gray-600">
              Important information for all participants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Fuel className="h-5 w-5 mr-2" />
                Bike Requirements
              </h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Well-maintained Royal Enfield</li>
                <li>• Valid registration & insurance</li>
                <li>• Full fuel tank at start</li>
                <li>• Basic toolkit</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Safety First
              </h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Mandatory helmet</li>
                <li>• Protective gear recommended</li>
                <li>• Follow group riding rules</li>
                <li>• Stay with the group</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                What to Bring
              </h3>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Valid driving license</li>
                <li>• Emergency contact details</li>
                <li>• Water & snacks</li>
                <li>• Camera for memories</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
