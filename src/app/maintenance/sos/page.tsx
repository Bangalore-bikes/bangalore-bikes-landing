"use client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
  Wrench,
  Fuel,
} from "lucide-react";

const emergencyContacts = [
  {
    name: "Bangalore Bikes Emergency Hotline",
    number: "+91 98765 43210",
    available: "24/7",
    coverage: "Bangalore & 50km radius",
    services: [
      "Breakdown Assistance",
      "Towing",
      "Minor Repairs",
      "Fuel Delivery",
    ],
    primary: true,
  },
  {
    name: "Royal Enfield Roadside Assistance",
    number: "1800-210-0007",
    available: "24/7",
    coverage: "Pan India",
    services: [
      "Official RSA",
      "Warranty Claims",
      "Genuine Parts",
      "Authorized Service",
    ],
    primary: false,
  },
  {
    name: "Karnataka State Police Highway Patrol",
    number: "100",
    available: "24/7",
    coverage: "Karnataka Highways",
    services: ["Emergency Response", "Traffic Assistance", "Safety Support"],
    primary: false,
  },
];

const commonIssues = [
  {
    issue: "Engine Won't Start",
    icon: Wrench,
    quickFixes: [
      "Check fuel level and reserve",
      "Ensure kill switch is OFF",
      "Check if bike is in neutral",
      "Try kick-starting if electric start fails",
    ],
    whenToCall: "If engine still won't start after basic checks",
  },
  {
    issue: "Flat Tire",
    icon: AlertTriangle,
    quickFixes: [
      "Move to safe location away from traffic",
      "Use puncture repair kit if available",
      "Check spare tube if you carry one",
      "Locate nearest tire shop",
    ],
    whenToCall: "If you don't have repair tools or spare tube",
  },
  {
    issue: "Out of Fuel",
    icon: Fuel,
    quickFixes: [
      "Switch to reserve tank",
      "Locate nearest fuel station",
      "Ask fellow riders for emergency fuel",
      "Use fuel delivery apps if available",
    ],
    whenToCall: "If stranded with no fuel stations nearby",
  },
  {
    issue: "Electrical Problems",
    icon: Shield,
    quickFixes: [
      "Check battery connections",
      "Look for loose wires",
      "Try bump starting if possible",
      "Check fuses if you have spares",
    ],
    whenToCall: "For complex electrical issues or if bike won't start",
  },
];

export default function SOSPage() {
  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bb-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              SOS & Roadside Assistance
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              24/7 emergency support when you need it most. We&apos;ve got your
              back on every ride.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Alert */}
      <section className="py-8 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>
                In case of medical emergency, always call 108 (Ambulance) first.
              </strong>
              <br />
              For road accidents involving injuries, call 100 (Police)
              immediately.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Emergency Contacts
            </h2>
            <p className="text-xl text-gray-600">
              Save these numbers in your phone before your next ride
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {emergencyContacts.map((contact, index) => (
              <Card
                key={index}
                className={`hover:shadow-lg transition-shadow duration-300 ${contact.primary ? "ring-2 ring-[var(--bb-gold)] ring-opacity-50" : ""}`}
              >
                <CardHeader className="text-center">
                  {contact.primary && (
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[var(--bb-gold)] text-white text-xs font-semibold mb-2">
                      PRIMARY CONTACT
                    </div>
                  )}
                  <CardTitle className="text-xl text-[var(--bb-navy)]">
                    {contact.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-[var(--bb-gold)] mb-2">
                      {contact.number}
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {contact.available}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {contact.coverage}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Services:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {contact.services.map((service, serviceIndex) => (
                        <li key={serviceIndex}>• {service}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className={`w-full ${contact.primary ? "bb-gold-gradient text-white" : "bg-gray-600 hover:bg-gray-700 text-white"}`}
                    onClick={() => window.open(`tel:${contact.number}`)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Troubleshooting */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Quick Troubleshooting Guide
            </h2>
            <p className="text-xl text-gray-600">
              Try these quick fixes before calling for assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commonIssues.map((item, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                      <item.icon className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-[var(--bb-navy)]">
                      {item.issue}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Quick Fixes:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {item.quickFixes.map((fix, fixIndex) => (
                        <li key={fixIndex} className="flex items-start">
                          <span className="text-[var(--bb-gold)] mr-2">•</span>
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>When to call:</strong> {item.whenToCall}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-[var(--bb-navy)] mb-4">
              Roadside Safety Tips
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Stay Visible</h3>
              <p className="text-blue-800 text-sm">
                Move your bike to the side of the road, turn on hazard lights,
                and wear reflective gear if available.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                Share Location
              </h3>
              <p className="text-green-800 text-sm">
                Always share your exact location when calling for help. Use GPS
                coordinates if possible.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Stay Calm</h3>
              <p className="text-purple-800 text-sm">
                Keep calm, assess the situation, and don't attempt repairs
                you're not confident about.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">
                Emergency Kit
              </h3>
              <p className="text-orange-800 text-sm">
                Carry basic tools, first aid kit, flashlight, and emergency
                contact numbers.
              </p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">
                Weather Awareness
              </h3>
              <p className="text-red-800 text-sm">
                In bad weather, prioritize safety over speed. Seek shelter if
                conditions are dangerous.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Communication
              </h3>
              <p className="text-gray-800 text-sm">
                Keep your phone charged and inform someone about your travel
                plans and expected arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
