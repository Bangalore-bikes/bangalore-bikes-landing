"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Knowledge & Maintenance", href: "/maintenance" },
  { name: "Blogs", href: "/blogs" },
  { name: "Rides", href: "/rides" },
  { name: "Destinations", href: "/destinations" },
  { name: "Wiki", href: "/wiki" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="shadow-lg sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-gradient-to-r from-[#3A5AFF] to-[#E94560] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>admin@bangalorebikes.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-yellow-300">
                🏍️ Ride Safe, Ride Together
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo-max-res.jpeg"
              alt="Bangalore Bikes"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div className="hidden sm:block">
              <h1 className="font-display text-2xl font-bold text-[var(--bb-navy)]">
                Bangalore Bikes
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-[var(--bb-gold)] font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--bb-gold)] transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="bb-gold-gradient text-white hover:opacity-90 transition-opacity">
              Join Community
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-[var(--bb-gold)] hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-700 hover:text-[var(--bb-gold)] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button className="w-full bb-gold-gradient text-white mt-4">
              Join Community
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
