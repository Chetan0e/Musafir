import { Link } from 'react-router-dom';
import { Compass, Map, BookOpen, Instagram, Twitter, Github, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Plan Trip', to: '/plan' },
    { label: 'Scan Place', to: '/scan' },
    { label: 'Stories', to: '/stories' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
  company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Contact', to: '#' },
  ],
  legal: [
    { label: 'Privacy', to: '#' },
    { label: 'Terms', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Compass className="w-5 h-5 text-accent" />
              </div>
              <span className="font-display text-2xl font-semibold text-text-primary italic">
                Musafir
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-xs mb-6">
              Your AI-powered travel companion. Plan personalized itineraries, discover hidden gems, and explore the world with confidence.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-text-tertiary hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-tertiary hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-tertiary hover:text-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-tertiary hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-text-tertiary text-sm">
            © {new Date().getFullYear()} Musafir. All rights reserved.
          </p>
          <p className="text-text-tertiary text-sm">
            Crafted with care for modern travelers
          </p>
        </div>
      </div>
    </footer>
  );
}
