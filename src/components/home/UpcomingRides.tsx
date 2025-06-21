import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const upcomingRides = [
  {
    title: "Weekend Getaway to Nandi Hills",
    description: "Join us for a thrilling ride to Nandi Hills this weekend.",
    imageUrl:
      "https://images.unsplash.com/photo-1572452571879-3d67d5b2a39f?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Ride to the Serene Backwaters",
    description: "Discover the beauty of the backwaters on two wheels.",
    imageUrl:
      "https://images.unsplash.com/photo-1550149550-33b46c745e03?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Explore the Western Ghats",
    description: "Experience the lush greenery of the Western Ghats.",
    imageUrl:
      "https://images.unsplash.com/photo-1629294148914-678ba902dd49?q=80&w=1512&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const UpcomingRides = () => {
  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center lg:text-start">
          Upcoming Rides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingRides.map((ride) => (
            <Card
              key={ride.title}
              className="overflow-hidden border-0 bg-transparent text-center lg:text-start"
            >
              <div className="relative h-60 w-full rounded-lg overflow-hidden">
                <Image
                  src={ride.imageUrl}
                  alt={ride.title}
                  fill
                  objectFit="cover"
                />
              </div>
              <CardHeader className="px-1">
                <CardTitle className="text-xl">{ride.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-1">
                <p className="text-gray-400">{ride.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
