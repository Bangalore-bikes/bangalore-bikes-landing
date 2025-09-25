"use client";

import Footer from "@/components/layout/Footer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  // Calendar,
  // MapPin,
  Users,
  Clock,
  Camera,
  Fuel,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import RideCard from "@/components/rides/RideCard";
import { upcomingRides, pastRides } from "@/data/rides";
import { motion } from "framer-motion";

export default function RidesPage() {
  return (
    <main>
      {/* <Header /> */}

      {/* Hero Section */}
      <section className="bb-gradient text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Official Rides
            </h1>
          </div>
          <Input placeholder="Search Rides" />
        </div>
      </section>

      {/* Upcoming Rides */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {upcomingRides.map((ride, index) => (
              <RideCard key={ride.id} ride={ride} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Past Rides Gallery */}
      <section className="py-16 ">
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
      <section className="py-16 ">
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
