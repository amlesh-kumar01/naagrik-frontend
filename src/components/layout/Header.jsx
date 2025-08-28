'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  MapPin,
  Plus,
  Home,
  AlertTriangle,
  Users,
  Award
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Report Issue', href: '/report', icon: Plus },
    { name: 'Map View', href: '/map', icon: MapPin },
    { name: 'Emergency', href: '/emergency', icon: AlertTriangle },
  ];

  if (user?.role === 'STEWARD' || user?.role === 'SUPER_ADMIN') {
    navigationItems.push({ name: 'Steward Dashboard', href: '/steward', icon: Users });
  }

  if (user?.role === 'SUPER_ADMIN') {
    navigationItems.push({ name: 'Admin Panel', href: '/admin', icon: Settings });
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'STEWARD':
        return 'bg-green-100 text-green-800';
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg border-0" style={{ 
      background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-[#3B38A0]" />
              </div>
              <span className="text-xl font-bold text-white">Naagrik</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-[#3B38A0] bg-white shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 p-2 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  >
                    <Avatar className="ring-2 ring-white/50">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback className="bg-white text-[#3B38A0] font-semibold">
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">{user.fullName}</p>
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        {user.role?.toLowerCase()}
                      </Badge>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 border-0">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-[#1A2A80]">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs bg-[#B2B0E8] text-[#1A2A80]">
                              {user.role?.toLowerCase()}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Award className="h-3 w-3 text-[#7A85C1]" />
                              <span>{user.reputation_score || 0} pts</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-[#1A2A80] hover:bg-[#B2B0E8]/20 rounded-lg transition-colors"
                        >
                          <User className="mr-3 h-4 w-4 text-[#7A85C1]" />
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-[#1A2A80] hover:bg-[#B2B0E8]/20 rounded-lg transition-colors"
                        >
                          <Settings className="mr-3 h-4 w-4 text-[#7A85C1]" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-[#3B38A0] hover:bg-white/90 shadow-lg">Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-white/20">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'text-[#3B38A0] bg-white shadow-lg'
                        : 'text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
