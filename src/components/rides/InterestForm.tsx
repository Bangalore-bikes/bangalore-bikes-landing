"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, AlertTriangle, Bike, Star } from "lucide-react";
import { InterestForm as InterestFormType } from "@/types/ride";

interface InterestFormProps {
    rideTitle: string;
    onSubmit: (data: InterestFormType) => void;
}

export default function InterestForm({ rideTitle, onSubmit }: InterestFormProps) {
    const [formData, setFormData] = useState<InterestFormType>({
        name: "",
        email: "",
        phone: "",
        emergencyContact: "",
        bikeModel: "",
        experience: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field: keyof InterestFormType, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[var(--bb-navy)] flex items-center">
                        <User className="mr-2 h-6 w-6" />
                        Express Interest in {rideTitle}
                    </CardTitle>
                    <p className="text-gray-600">
                        Fill out this form to register your interest. We&apos;ll get back to you with confirmation details.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="name" className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="email" className="flex items-center">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="phone" className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Phone Number *
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="+91 9876543210"
                                    required
                                />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="emergencyContact" className="flex items-center">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Emergency Contact *
                            </Label>
                            <Input
                                id="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                                placeholder="Emergency contact name and number"
                                required
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-2"
                            >
                                <Label className="flex items-center">
                                    <Bike className="mr-2 h-4 w-4" />
                                    Bike Model *
                                </Label>
                                <Select onValueChange={(value) => handleInputChange("bikeModel", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your bike model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="classic-350">Royal Enfield Classic 350</SelectItem>
                                        <SelectItem value="bullet-350">Royal Enfield Bullet 350</SelectItem>
                                        <SelectItem value="interceptor-650">Royal Enfield Interceptor 650</SelectItem>
                                        <SelectItem value="continental-gt-650">Royal Enfield Continental GT 650</SelectItem>
                                        <SelectItem value="himalayan">Royal Enfield Himalayan</SelectItem>
                                        <SelectItem value="meteor-350">Royal Enfield Meteor 350</SelectItem>
                                        <SelectItem value="hunter-350">Royal Enfield Hunter 350</SelectItem>
                                        <SelectItem value="scram-411">Royal Enfield Scram 411</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-2"
                            >
                                <Label className="flex items-center">
                                    <Star className="mr-2 h-4 w-4" />
                                    Riding Experience *
                                </Label>
                                <Select onValueChange={(value) => handleInputChange("experience", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your experience level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                                        <SelectItem value="experienced">Experienced (3-5 years)</SelectItem>
                                        <SelectItem value="expert">Expert (5+ years)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="message">Additional Message</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                                placeholder="Any special requirements or questions?"
                                rows={4}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button
                                type="submit"
                                className="w-full bb-gold-gradient text-white text-lg py-3"
                            >
                                Submit Interest
                            </Button>
                        </motion.div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
