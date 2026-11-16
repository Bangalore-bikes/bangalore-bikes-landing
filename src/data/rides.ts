import { parseRides } from "@/lib/rideSchema";
import content from "./rides.json";

// Add only organizer-confirmed events approved for public listing.
// Fixtures belong in tests, never in this published collection.
export const rides = parseRides(content);
