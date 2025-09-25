export interface Ride {
  id: string;
  title: string;
  date: string;
  time: string;
  meetingPoint: string;
  destination: string;
  distance: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  participants: number;
  maxParticipants: number;
  description: string;
  highlights: string[];
  image: string;
  status: "open" | "filling-fast" | "full";
  price?: number;
  detailedDescription?: string;
  itinerary?: ItineraryItem[];
  included?: string[];
  excluded?: string[];
  requirements?: string[];
  organizer?: {
    name: string;
    experience: string;
    avatar?: string;
  };
}

export interface ItineraryItem {
  time: string;
  activity: string;
  description?: string;
}

export interface PastRide {
  id: string;
  title: string;
  date: string;
  participants: number;
  images: number;
  image: string;
}

export interface InterestForm {
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  bikeModel: string;
  experience: string;
  message?: string;
}
