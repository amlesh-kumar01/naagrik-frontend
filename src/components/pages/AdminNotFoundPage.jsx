'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { colors } from '../../lib/theme';
import { 
  Settings, 
  ArrowLeft, 
  Users, 
  Shield,
  AlertTriangle,
  BarChart3,
  MapPin,
  Award,
  Home
} from 'lucide-react';

const AdminNotFoundPage = () => {
  const router = useRouter();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Stewards', href: '/admin/stewards', icon: Shield },
    { name: 'Issues', href: '/admin/issues', icon: AlertTriangle },
    { name: 'Zones', href: '/admin/zones', icon: MapPin },
    { name: 'Badges', href: '/admin/badges', icon: Award },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg mx-auto px-6 text-center">
        {/* Minimalist 404 */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <Settings className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-6xl font-light text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Admin page not found</h2>
          <p className="text-gray-600">
            The admin page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/admin" className="block">
            <Button variant="primary" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          </Link>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Main Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Quick Links */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">Admin sections:</p>
          <div className="grid grid-cols-3 gap-4">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Admin access required
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFoundPage;
