import { Ride, PastRide } from "@/types/ride";

export const upcomingRides: Ride[] = [
  {
    id: "nandi-hills-sunrise",
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
    price: 1500,
    detailedDescription: `Join us for an unforgettable sunrise experience at the majestic Nandi Hills. This ride is perfect for beginners and seasoned riders alike who want to witness one of Karnataka's most spectacular sunrises.

    Starting early from Hebbal Flyover, we'll cruise through the cool morning air as the city sleeps. The 65km journey takes us through scenic countryside roads, gradually ascending to the historic hill station that has been a favorite retreat for centuries.

    Nandi Hills offers not just stunning sunrise views but also rich history, with ancient temples and colonial-era structures dotting the landscape. The ride back includes stops at local breakfast joints where you can savor authentic South Indian delicacies.`,
    itinerary: [
      {
        time: "5:00 AM",
        activity: "Meet at Hebbal Flyover",
        description: "Bike inspection, safety briefing, and group formation",
      },
      {
        time: "5:30 AM",
        activity: "Ride begins",
        description: "Start the journey towards Nandi Hills",
      },
      {
        time: "6:30 AM",
        activity: "Reach Nandi Hills",
        description: "Park bikes and head to viewpoint",
      },
      {
        time: "6:45 AM",
        activity: "Sunrise viewing",
        description: "Photography session and breakfast",
      },
      {
        time: "8:30 AM",
        activity: "Temple visit",
        description: "Explore Bhoga Nandeeshwara Temple",
      },
      {
        time: "9:30 AM",
        activity: "Return journey",
        description: "Head back to Bangalore with breakfast stop",
      },
    ],
    included: [
      "Ride leader and support",
      "Route guidance",
      "Group photography",
      "Basic first aid support",
      "Breakfast at hills (optional)",
    ],
    excluded: [
      "Fuel costs",
      "Personal expenses",
      "Bike maintenance",
      "Entry fees to monuments",
    ],
    requirements: [
      "Well-maintained Royal Enfield motorcycle",
      "Valid driving license and insurance",
      "Mandatory helmet",
      "Protective riding gear recommended",
      "Full fuel tank at start",
    ],
    organizer: {
      name: "Rajesh Kumar",
      experience: "5+ years leading rides",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    },
  },
  {
    id: "coorg-coffee-trail",
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
    price: 4500,
    detailedDescription: `Escape to the Scotland of India for a weekend filled with coffee aromas, misty hills, and thrilling rides through winding mountain roads. This two-day adventure takes you deep into Coorg's coffee country.

    Experience the authentic coffee culture with plantation tours, taste fresh brews, and learn about the journey from bean to cup. The weekend includes visits to stunning waterfalls, interaction with local Kodava culture, and comfortable homestay accommodation.

    The riding routes feature some of Karnataka's most scenic ghat sections with challenging curves perfect for Royal Enfield enthusiasts. Every turn reveals new vistas of rolling hills covered in coffee and spice plantations.`,
    itinerary: [
      {
        time: "Day 1 - 6:00 AM",
        activity: "Departure from Bangalore",
        description:
          "Meet at Electronic City, safety briefing, and ride begins",
      },
      {
        time: "10:00 AM",
        activity: "Breakfast stop",
        description: "Traditional breakfast at Channapatna",
      },
      {
        time: "2:00 PM",
        activity: "Reach Madikeri",
        description: "Check-in to homestay, lunch and rest",
      },
      {
        time: "4:00 PM",
        activity: "Coffee plantation tour",
        description: "Learn about coffee processing and tasting",
      },
      {
        time: "Day 2 - 7:00 AM",
        activity: "Abbey Falls visit",
        description: "Trek to the beautiful waterfall",
      },
      {
        time: "11:00 AM",
        activity: "Local sightseeing",
        description: "Raja's Seat and Madikeri Fort",
      },
      {
        time: "2:00 PM",
        activity: "Return journey",
        description: "Lunch and ride back to Bangalore",
      },
    ],
    included: [
      "Homestay accommodation (1 night)",
      "All meals during the trip",
      "Coffee plantation tour",
      "Local guide",
      "Support vehicle",
    ],
    excluded: [
      "Fuel costs",
      "Personal shopping",
      "Entry fees to monuments",
      "Travel insurance",
    ],
    requirements: [
      "Intermediate riding experience",
      "Well-maintained motorcycle",
      "Valid documents",
      "Warm clothing for morning rides",
      "Rain gear (during monsoon)",
    ],
    organizer: {
      name: "Priya Nair",
      experience: "3+ years organizing tours",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    },
  },
  {
    id: "hampi-heritage",
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
    price: 8500,
    detailedDescription: `Embark on an epic journey to the ruins of the Vijayanagara Empire at Hampi, a UNESCO World Heritage Site. This challenging 3-day expedition combines long-distance riding with cultural immersion and adventure camping.

    Navigate through diverse landscapes from Bangalore's tech corridors to the boulder-strewn terrain of Hampi. Experience the grandeur of ancient Indian architecture, ride through surreal rock formations, and camp under the stars.

    This trip is designed for experienced riders who can handle long distances and varied terrain. The reward is an unforgettable experience exploring one of India's most significant historical sites while enjoying the camaraderie of fellow Royal Enfield enthusiasts.`,
    itinerary: [
      {
        time: "Day 1 - 5:30 AM",
        activity: "Departure to Hampi",
        description: "Long ride day covering 350km with stops",
      },
      {
        time: "12:00 PM",
        activity: "Lunch at Chitradurga",
        description: "Visit Chitradurga Fort and local cuisine",
      },
      {
        time: "6:00 PM",
        activity: "Reach Hampi",
        description: "Setup camp and sunset at Hemakuta Hill",
      },
      {
        time: "Day 2 - 6:00 AM",
        activity: "Temple exploration",
        description: "Virupaksha Temple and Vittala Temple complex",
      },
      {
        time: "2:00 PM",
        activity: "Coracle ride",
        description: "Cross Tungabhadra River in traditional boats",
      },
      {
        time: "4:00 PM",
        activity: "Royal enclosure",
        description: "Explore Lotus Mahal and Elephant Stables",
      },
      {
        time: "Day 3 - 7:00 AM",
        activity: "Sunrise at Matanga Hill",
        description: "Trek and panoramic views",
      },
      {
        time: "10:00 AM",
        activity: "Return journey",
        description: "Gradual ride back to Bangalore",
      },
    ],
    included: [
      "Camping equipment and tents",
      "All meals during expedition",
      "Professional guide",
      "Entry fees to monuments",
      "Coracle ride",
      "Support vehicle with mechanic",
    ],
    excluded: [
      "Fuel costs",
      "Personal gear",
      "Tips to guides",
      "Travel insurance",
    ],
    requirements: [
      "Advanced riding experience (minimum 3 years)",
      "Long-distance riding capability",
      "Physical fitness for camping",
      "Complete riding gear mandatory",
      "Emergency contact details",
    ],
    organizer: {
      name: "Vikram Singh",
      experience: "8+ years adventure touring",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    },
  },
];

export const pastRides: PastRide[] = [
  {
    id: "chikmagalur-coffee",
    title: "Chikmagalur Coffee Circuit",
    date: "2024-01-08",
    participants: 22,
    images: 12,
    image: "https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg",
  },
  {
    id: "mysore-palace",
    title: "Mysore Palace Night Ride",
    date: "2024-01-01",
    participants: 35,
    images: 28,
    image: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg",
  },
];

export const getRideById = (id: string): Ride | undefined => {
  return upcomingRides.find((ride) => ride.id === id);
};
