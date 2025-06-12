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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Users,
  Wrench,
} from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us for immediate assistance",
    contact: "+91 98765 43210",
    availability: "Mon-Sat: 9:00 AM - 7:00 PM",
    color: "bg-blue-100 text-blue-800",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us your queries via email",
    contact: "admin@bangalorebikes.com",
    availability: "Response within 24 hours",
    color: "bg-green-100 text-green-800",
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Connect with fellow riders",
    contact: "Join our WhatsApp group",
    availability: "Active 24/7",
    color: "bg-purple-100 text-purple-800",
  },
];

const officeInfo = {
  address: "Bangalore, Karnataka, India 560001",
  coordinates: "12.9716° N, 77.5946° E",
  hours: {
    weekdays: "9:00 AM - 7:00 PM",
    saturday: "9:00 AM - 5:00 PM",
    sunday: "Closed",
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "",
      message: "",
    });
  };

  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bb-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Have questions about Royal Enfield maintenance, upcoming rides, or
              want to join our community? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600">
              Choose the best way to reach us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${method.color} mb-4 mx-auto`}
                  >
                    <method.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {method.title}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="font-semibold text-[var(--bb-gold)] text-lg mb-1">
                      {method.contact}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.availability}
                    </div>
                  </div>
                  <Button className="w-full bb-gold-gradient text-white">
                    Contact Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--bb-navy)] flex items-center">
                  <Send className="h-6 w-6 mr-2" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">
                          Maintenance Help
                        </SelectItem>
                        <SelectItem value="rides">Rides & Events</SelectItem>
                        <SelectItem value="community">
                          Community Questions
                        </SelectItem>
                        <SelectItem value="technical">
                          Technical Support
                        </SelectItem>
                        <SelectItem value="partnership">
                          Partnership Inquiry
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="mt-1"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bb-gold-gradient text-white"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Information */}
            <div className="space-y-8">
              {/* Office Details */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-[var(--bb-navy)] flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Address
                      </h4>
                      <p className="text-gray-600">{officeInfo.address}</p>
                      <p className="text-sm text-gray-500">
                        {officeInfo.coordinates}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Office Hours
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Monday - Friday:</span>
                          <span>{officeInfo.hours.weekdays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday:</span>
                          <span>{officeInfo.hours.saturday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday:</span>
                          <span>{officeInfo.hours.sunday}</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bb-gold-gradient text-white">
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Maintenance Guides
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Join Community
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-[var(--bb-gold)] hover:text-white hover:border-[var(--bb-gold)]"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Upcoming Rides
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Interactive Map</p>
                      <p className="text-sm">Google Maps integration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  How do I join a ride?
                </h3>
                <p className="text-gray-600 text-sm">
                  Visit our Rides page, select an upcoming ride, and click
                  "Register Now". Make sure to read the ride guidelines before
                  registering.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  Do you provide roadside assistance?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes, we have 24/7 roadside assistance available. Check our SOS
                  page for emergency contact numbers and coverage areas.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  Can I contribute to the blog?
                </h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! We welcome community contributions. Contact us
                  with your article ideas or riding experiences to share.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  Are maintenance guides free?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes, all our DIY maintenance guides are completely free. We
                  believe in sharing knowledge to help the Royal Enfield
                  community.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  How do I find trusted garages?
                </h3>
                <p className="text-gray-600 text-sm">
                  Visit our Trusted Garages section where we list verified
                  service centers across Bangalore with ratings and contact
                  information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--bb-navy)] mb-2">
                  What about shipping information?
                </h3>
                <p className="text-gray-600 text-sm">
                  Our Wiki section has comprehensive shipping details for parts
                  and accessories, including rates, delivery times, and
                  international shipping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
