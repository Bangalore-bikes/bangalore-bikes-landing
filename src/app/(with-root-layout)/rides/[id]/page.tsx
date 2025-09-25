"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InterestForm from "@/components/rides/InterestForm";
import Footer from "@/components/layout/Footer";
import { getRideById } from "@/data/rides";
import { InterestForm as InterestFormType } from "@/types/ride";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    Star,
    Check,
    X,
    Fuel,
    Shield,
    Mountain,
    Navigation,
} from "lucide-react";

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

export default function RideDetailPage() {
    const params = useParams();
    const [showInterestForm, setShowInterestForm] = useState(false);
    const ride = getRideById(params.id as string);

    if (!ride) {
        notFound();
    }

    const handleInterestSubmit = (data: InterestFormType) => {
        console.log("Interest submitted:", data);
        // Here you would typically send the data to your backend
        alert("Thank you for your interest! We'll get back to you soon.");
        setShowInterestForm(false);
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="mt-16 relative h-96 overflow-hidden rounded-md mb-8">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${ride.image})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white"
                    >
                        <Link
                            href="/rides"
                            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Rides
                        </Link>
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                            {ride.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                            {ride.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-6">
                            <Badge className={getDifficultyColor(ride.difficulty)}>
                                {ride.difficulty}
                            </Badge>
                            <Badge className={getStatusColor(ride.status)}>
                                {ride.status === "filling-fast" ? "Filling Fast" : ride.status}
                            </Badge>
                            {ride.price && (
                                <Badge className="bg-blue-100 text-blue-800">
                                    ₹{ride.price.toLocaleString()}
                                </Badge>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Info */}
            <section className="py-8 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        <div className="text-center">
                            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="font-semibold text-lg">
                                {new Date(ride.date).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">{ride.time}</div>
                        </div>
                        <div className="text-center">
                            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="font-semibold text-lg">{ride.distance}</div>
                            <div className="text-gray-500">Distance</div>
                        </div>
                        <div className="text-center">
                            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                            <div className="font-semibold text-lg">{ride.duration}</div>
                            <div className="text-gray-500">Duration</div>
                        </div>
                        <div className="text-center">
                            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <div className="font-semibold text-lg">
                                {ride.participants}/{ride.maxParticipants}
                            </div>
                            <div className="text-gray-500">Riders</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Mountain className="mr-2 h-5 w-5" />
                                            About This Ride
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <p className="text-gray-700 leading-relaxed">
                                                {ride.detailedDescription}
                                            </p>
                                            <div>
                                                <h4 className="font-semibold mb-2">Meeting Point:</h4>
                                                <p className="text-gray-600 flex items-center">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {ride.meetingPoint}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Highlights:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {ride.highlights.map((highlight, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {highlight}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Itinerary */}
                            {ride.itinerary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Navigation className="mr-2 h-5 w-5" />
                                                Itinerary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {ride.itinerary.map((item, index) => (
                                                    <div key={index} className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0 w-20 text-sm font-semibold text-blue-600">
                                                            {item.time}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold">{item.activity}</h4>
                                                            {item.description && (
                                                                <p className="text-gray-600 text-sm mt-1">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* What's Included/Excluded */}
                            {(ride.included || ride.excluded) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {ride.included && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-green-700">
                                                    <Check className="mr-2 h-5 w-5" />
                                                    What&apos;s Included
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {ride.included.map((item, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <Check className="mr-2 h-4 w-4 text-green-600" />
                                                            <span className="text-sm">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {ride.excluded && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-red-700">
                                                    <X className="mr-2 h-5 w-5" />
                                                    What&apos;s Not Included
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {ride.excluded.map((item, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <X className="mr-2 h-4 w-4 text-red-600" />
                                                            <span className="text-sm">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                </motion.div>
                            )}

                            {/* Requirements */}
                            {ride.requirements && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Shield className="mr-2 h-5 w-5" />
                                                Requirements
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {ride.requirements.map((req, index) => (
                                                    <li key={index} className="flex items-center">
                                                        <Fuel className="mr-2 h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column - Booking */}
                        <div className="space-y-6">
                            {/* Organizer */}
                            {ride.organizer && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Ride Organizer</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center space-x-3">
                                                {ride.organizer.avatar && (
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                                        <Image
                                                            src={ride.organizer.avatar}
                                                            alt={ride.organizer.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold">{ride.organizer.name}</h4>
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <Star className="mr-1 h-3 w-3" />
                                                        {ride.organizer.experience}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Booking Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="sticky top-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Express Interest
                                            {ride.price && (
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ₹{ride.price.toLocaleString()}
                                                </span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <div className="font-semibold text-lg text-blue-700">
                                                {ride.maxParticipants - ride.participants} spots left
                                            </div>
                                            <div className="text-sm text-blue-600">
                                                of {ride.maxParticipants} total spots
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setShowInterestForm(true)}
                                            className="w-full bb-gold-gradient text-white text-lg py-3"
                                            disabled={ride.status === "full"}
                                        >
                                            {ride.status === "full" ? "Ride Full" : "Express Interest"}
                                        </Button>

                                        <div className="text-center">
                                            <p className="text-sm text-gray-600">
                                                Free to express interest
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Payment required only after confirmation
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interest Form Modal */}
            {showInterestForm && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className=" rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Express Interest</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowInterestForm(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <InterestForm
                                rideTitle={ride.title}
                                onSubmit={handleInterestSubmit}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
