import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              Paylor
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Your Till, Paybill & Bank Reconciliation Made Easy! Perfect for Online Hustles, Restaurants, Bars, Retailers, Supermarkets, Developers, and Communities.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:hello@paylor.com" className="hover:text-white transition-colors">hello@paylor.com</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+254765344101" className="hover:text-white transition-colors">+254 765 344 101</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/docs" className="text-gray-400 hover:text-primary text-sm transition-colors">API Docs</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-primary text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/status" className="text-gray-400 hover:text-primary text-sm transition-colors">Service Status</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-primary text-sm transition-colors">Request A Feature</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-primary text-sm transition-colors">About Us</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-primary text-sm transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-primary text-sm transition-colors">Sign In</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-primary text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Paylor. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>

          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
