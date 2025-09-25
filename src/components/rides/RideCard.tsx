"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/aceternity-effects";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Camera,
    ArrowRight,
} from "lucide-react";
import { Ride } from "@/types/ride";

interface RideCardProps {
    ride: Ride;
    index?: number;
}

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

export default function RideCard({ ride, index = 0 }: RideCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
            }}
            whileHover={{ scale: 1.02 }}
            className="w-full"
        >
            <Card className="overflow-hidden group">
                <div className="md:flex">
                    <motion.div
                        className="md:w-1/3 relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className="h-64 md:h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundImage: `url(${ride.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    <div className="md:w-2/3 p-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="flex justify-between items-start mb-4"
                        >
                            <div>
                                <h3 className="font-display text-2xl font-bold text-[var(--bb-navy)] mb-2 group-hover:text-blue-600 transition-colors">
                                    {ride.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{ride.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Badge className={getDifficultyColor(ride.difficulty)}>
                                    {ride.difficulty}
                                </Badge>
                                <Badge className={getStatusColor(ride.status)}>
                                    {ride.status === "filling-fast" ? "Filling Fast" : ride.status}
                                </Badge>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm"
                        >
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.4 }}
                            className="mb-6"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">Meeting Point:</span>
                                <span className="text-sm text-gray-600">{ride.meetingPoint}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Camera className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">Highlights:</span>
                                <div className="flex flex-wrap gap-1">
                                    {ride.highlights.map((highlight, highlightIndex) => (
                                        <motion.div
                                            key={highlightIndex}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 + 0.5 + highlightIndex * 0.05 }}
                                        >
                                            <Badge variant="secondary" className="text-xs">
                                                {highlight}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.6 }}
                            className="flex space-x-4"
                        >
                            <Link href={`/rides/${ride.id}`} className="flex-1">
                                <Button className="bb-gold-gradient text-white w-full group-hover:shadow-lg transition-shadow">
                                    Express Interest
                                </Button>
                            </Link>
                            <Link href={`/rides/${ride.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
