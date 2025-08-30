'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { colors } from '../../lib/theme';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  MapPin,
  AlertTriangle
} from 'lucide-react';

const NotFoundPage = () => {
  const router = useRouter();

  const quickLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Issues', href: '/issues', icon: AlertTriangle },
    { name: 'Map', href: '/map', icon: MapPin },
    { name: 'Report', href: '/report', icon: Search },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto px-6 text-center">
        {/* Minimalist 404 */}
        <div className="mb-8">
          <h1 className="text-8xl font-light text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Page not found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/" className="block">
            <Button variant="primary" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">Or try these pages:</p>
          <div className="flex justify-center space-x-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
