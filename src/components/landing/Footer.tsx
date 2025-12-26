import React from 'react';
import { Heart, ArrowRight, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay Updated with Healthcare Insights
            </h3>
            <p className="text-lg text-gray-400 mb-8">
              Get the latest news, tips, and product updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl py-6 focus:border-primary"
              />
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-8 py-6 rounded-xl font-semibold whitespace-nowrap">
                Subscribe
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">HealthCare</span>
                <span className="block text-xs text-gray-500">HMS Platform</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering healthcare providers with cutting-edge technology for exceptional patient care.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <button 
                  key={index}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['About Us', 'Services', 'Departments', 'Careers', 'Blog'].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Documentation', 'API Reference'].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="text-gray-400">1-800-HEALTH</div>
                  <div className="text-xs text-gray-500">Mon-Fri, 9am-6pm EST</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-gray-400">support@healthcare-hms.com</div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-gray-400">
                  123 Medical Plaza<br />
                  San Francisco, CA 94102
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} HealthCare HMS. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;