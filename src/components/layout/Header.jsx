'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { componentColors, colors } from '../../lib/theme';
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
  Award,
  Shield,
  ChevronDown,
  BarChart3
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.admin-dropdown') && !event.target.closest('.admin-button')) {
        setIsAdminMenuOpen(false);
      }
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-button')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Report Issue', href: '/report', icon: Plus },
    { name: 'Map View', href: '/map', icon: MapPin },
    { name: 'Issues', href: '/issues', icon: AlertTriangle }
  ];

  // Add steward application link for eligible users (not already stewards/admins)
  if (user && user.role === 'CITIZEN') {
    navigationItems.push({ name: 'Become Steward', href: '/steward/apply', icon: Award });
  }

  if (user?.role === 'STEWARD' || user?.role === 'SUPER_ADMIN') {
    navigationItems.push({ name: 'Steward Dashboard', href: '/steward', icon: Shield });
  }

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Stewards', href: '/admin/stewards', icon: Shield },
    { name: 'Zones', href: '/admin/zones', icon: MapPin },
    { name: 'Badges', href: '/admin/badges', icon: Award },
    { name: 'Issues', href: '/admin/issues', icon: AlertTriangle }
  ];

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
      background: componentColors.header.background,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6" style={{ color: colors.primary[400] }} />
              </div>
              <span className="text-xl font-bold" style={{ color: componentColors.header.text }}>
                Naagrik
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200`}
                  style={isActive ? {
                    color: componentColors.header.activeTab.text,
                    backgroundColor: componentColors.header.activeTab.background,
                    boxShadow: componentColors.card.shadow
                  } : {
                    color: componentColors.header.textSecondary
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.closest('a').style.backgroundColor = componentColors.header.hover;
                      e.target.closest('a').style.color = componentColors.header.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.closest('a').style.backgroundColor = 'transparent';
                      e.target.closest('a').style.color = componentColors.header.textSecondary;
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Admin Dropdown */}
            {user?.role === 'SUPER_ADMIN' && (
              <div className="relative admin-dropdown">
                <Button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="admin-button flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-transparent border-0"
                  style={pathname.startsWith('/admin') ? {
                    color: componentColors.header.activeTab.text,
                    backgroundColor: componentColors.header.activeTab.background,
                    boxShadow: componentColors.card.shadow
                  } : {
                    color: componentColors.header.textSecondary
                  }}
                  onMouseEnter={(e) => {
                    if (!pathname.startsWith('/admin')) {
                      e.target.style.backgroundColor = componentColors.header.hover;
                      e.target.style.color = componentColors.header.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!pathname.startsWith('/admin')) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = componentColors.header.textSecondary;
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isAdminMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2 z-50"
                    style={{
                      backgroundColor: componentColors.admin.dropdown.background,
                      border: `1px solid ${componentColors.admin.dropdown.border}`,
                      boxShadow: componentColors.admin.dropdown.shadow
                    }}
                  >
                    {adminMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActiveItem = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsAdminMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm transition-colors"
                          style={isActiveItem ? {
                            color: componentColors.admin.dropdown.activeItem.text,
                            backgroundColor: componentColors.admin.dropdown.activeItem.background,
                            borderRight: `2px solid ${componentColors.admin.dropdown.activeItem.border}`
                          } : {
                            color: '#374151'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActiveItem) {
                              e.target.style.backgroundColor = componentColors.admin.dropdown.itemHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveItem) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative backdrop-blur-sm"
                  style={{ 
                    color: componentColors.header.text,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = componentColors.header.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Bell className="h-5 w-5" />
                  <span 
                    className="absolute -top-1 -right-1 h-4 w-4 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.semantic.error }}
                  >
                    3
                  </span>
                </Button>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="profile-button flex items-center space-x-3 text-sm rounded-full focus:outline-none p-2 backdrop-blur-sm transition-all duration-200"
                    style={{ 
                      focusRing: `2px solid ${componentColors.header.hover}`,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = componentColors.header.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Avatar className="ring-2" style={{ ringColor: componentColors.header.hover }}>
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback 
                        className="bg-white font-semibold"
                        style={{ color: colors.primary[400] }}
                      >
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium" style={{ color: componentColors.header.text }}>
                        {user.fullName}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs border-0"
                        style={{ 
                          backgroundColor: componentColors.header.hover,
                          color: componentColors.header.text 
                        }}
                      >
                        {user.role?.toLowerCase()}
                      </Badge>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 backdrop-blur-sm rounded-xl ring-1 ring-black ring-opacity-5 z-50 border-0"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: componentColors.card.shadow
                      }}
                    >
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium" style={{ color: colors.primary[500] }}>
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: colors.primary[200],
                                color: colors.primary[500] 
                              }}
                            >
                              {user.role?.toLowerCase()}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Award className="h-3 w-3" style={{ color: colors.primary[300] }} />
                              <span>{user.reputation_score || 0} pts</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                          style={{ 
                            color: colors.primary[600], 
                            ':hover': { backgroundColor: colors.primary[100] + '20' }
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <User className="mr-3 h-4 w-4" style={{ color: colors.primary[400] }} />
                          Your Profile
                        </Link>
                        {user.role === 'CITIZEN' && (
                          <Link
                            href="/steward/apply"
                            className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                            style={{ 
                              color: colors.primary[600], 
                              ':hover': { backgroundColor: colors.primary[100] + '20' }
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Award className="mr-3 h-4 w-4" style={{ color: colors.primary[400] }} />
                            Become Steward
                          </Link>
                        )}
                        {user.role === 'SUPER_ADMIN' && (
                          <div className="border-t border-gray-200 my-1">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Panel</p>
                            </div>
                            {adminMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                                  style={{ 
                                    color: colors.primary[600], 
                                    ':hover': { backgroundColor: colors.primary[100] + '20' }
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                  <Icon className="mr-3 h-4 w-4" style={{ color: colors.primary[400] }} />
                                  {item.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors"
                          style={{ 
                            color: colors.primary[600], 
                            ':hover': { backgroundColor: colors.primary[100] + '20' }
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Settings className="mr-3 h-4 w-4" style={{ color: colors.primary[400] }} />
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
                  <Button variant="primary" className="shadow-lg">Sign up</Button>
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
              
              {/* Admin Mobile Menu */}
              {user?.role === 'SUPER_ADMIN' && (
                <div className="border-t border-white/20 mt-3 pt-3">
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Admin Panel</p>
                  </div>
                  {adminMenuItems.map((item) => {
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
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
