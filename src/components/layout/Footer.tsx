import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bb-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/BB-logo.jpg"
                alt="Bangalore Bikes"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--bb-gold)]">
                  Bangalore Bikes
                </h3>
                <p className="text-sm text-gray-300">Est. 2024</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Your ultimate destination for Royal Enfield maintenance, epic rides, and a thriving motorcycle community in Bangalore.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[var(--bb-gold)] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/maintenance" className="text-gray-300 hover:text-white transition-colors">DIY Maintenance</Link></li>
              <li><Link href="/maintenance/garages" className="text-gray-300 hover:text-white transition-colors">Trusted Garages</Link></li>
              <li><Link href="/maintenance/sos" className="text-gray-300 hover:text-white transition-colors">Roadside Assistance</Link></li>
              <li><Link href="/rides" className="text-gray-300 hover:text-white transition-colors">Official Rides</Link></li>
              <li><Link href="/destinations" className="text-gray-300 hover:text-white transition-colors">Destinations</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-[var(--bb-gold)] mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blogs" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/wiki" className="text-gray-300 hover:text-white transition-colors">Wiki</Link></li>
              <li><Link href="/wiki/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Details</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-[var(--bb-gold)] mb-4">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-[var(--bb-gold)] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Bangalore, Karnataka<br />
                  India 560001
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[var(--bb-gold)]" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[var(--bb-gold)]" />
                <span className="text-gray-300">admin@bangalorebikes.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Bangalore Bikes. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}