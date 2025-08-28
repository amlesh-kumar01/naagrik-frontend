'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  Star, 
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Shield,
  Award,
  Phone,
  Globe
} from 'lucide-react';

const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();

  const stats = [
    { label: 'Issues Reported', value: '2,847', icon: AlertTriangle, color: 'text-blue-600' },
    { label: 'Issues Resolved', value: '2,123', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Active Citizens', value: '1,562', icon: Users, color: 'text-purple-600' },
    { label: 'Response Rate', value: '94%', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const features = [
    {
      icon: AlertTriangle,
      title: 'Report Issues',
      description: 'Easily report community problems with photos and location data',
      href: '/report/add',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: MapPin,
      title: 'Interactive Map',
      description: 'View issues on an interactive map of your community',
      href: '/map',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect with neighbors and local authorities',
      href: '/issues',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Shield,
      title: 'Emergency Reporting',
      description: 'Quick access for emergency and urgent situations',
      href: '/emergency',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const recentIssues = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      status: 'IN_PROGRESS',
      category: 'Road Infrastructure',
      location: 'Main St & 5th Ave',
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      title: 'Broken Street Light',
      status: 'ACKNOWLEDGED',
      category: 'Street Lighting',
      location: 'Park Avenue',
      timeAgo: '4 hours ago',
    },
    {
      id: 3,
      title: 'Graffiti on Public Building',
      status: 'RESOLVED',
      category: 'Vandalism',
      location: 'City Hall',
      timeAgo: '1 day ago',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'ACKNOWLEDGED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Hero Section */}
      <section className="text-white" style={{ background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 50%, #3B38A0 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building Better <span className="text-white/80">Communities</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Report issues, track progress, and engage with your local community 
              to create positive change where you live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/report/add">
                  <Button
                    size="lg"
                    className="bg-white text-[#3B38A0] hover:bg-white/90 px-8 py-4 text-lg font-medium shadow-xl transition-all duration-200 transform hover:scale-105"
                    style={{ boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)' }}
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    Report an Issue
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-[#3B38A0] hover:bg-white/90 px-8 py-4 text-lg font-medium shadow-xl transition-all duration-200 transform hover:scale-105"
                      style={{ boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)' }}
                    >
                      Get Started
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-[#3B38A0] px-8 py-4 text-lg font-medium transition-all duration-200 backdrop-blur-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 100%)' 
                  }}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-[#1A2A80] mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A2A80] mb-4">
              How CivicConnect Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to report issues, track progress, and collaborate 
              with your community to create positive change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{
                      background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
                    }}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-[#1A2A80]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-4 text-gray-600">
                      {feature.description}
                    </CardDescription>
                    <Link href={feature.href}>
                      <Button 
                        variant="outline" 
                        className="w-full border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white transition-all duration-200"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      {isAuthenticated && (
        <section className="py-16 bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A2A80]">Recent Issues</h2>
              <Link href="/issues">
                <Button 
                  variant="outline" 
                  className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white transition-all duration-200"
                >
                  View All Issues
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2 text-[#1A2A80]">{issue.title}</CardTitle>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-[#7A85C1]" />
                        {issue.category}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-[#7A85C1]" />
                        {issue.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-[#7A85C1]" />
                        {issue.timeAgo}
                      </div>
                    </div>
                    <Link href={`/issues/${issue.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4 border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white transition-all duration-200" 
                      >
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 text-white" style={{ background: 'linear-gradient(135deg, #3B38A0 0%, #1A2A80 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens working together to improve their communities.
          </p>
          {isAuthenticated ? (
            <Link href="/report/add">
              <Button
                size="lg"
                className="bg-white text-[#3B38A0] hover:bg-white/90 px-8 py-4 text-lg font-medium shadow-xl transition-all duration-200 transform hover:scale-105"
                style={{ boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)' }}
              >
                <Plus className="h-6 w-6 mr-2" />
                Report Your First Issue
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#3B38A0] hover:bg-white/90 px-8 py-4 text-lg font-medium shadow-xl transition-all duration-200 transform hover:scale-105"
                style={{ boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)' }}
              >
                Join CivicConnect Today
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
