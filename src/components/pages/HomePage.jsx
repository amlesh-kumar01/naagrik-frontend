'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useIssuesStore } from '../../store';
import { useDashboardStore } from '../../store';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { formatRelativeTime } from '../../lib/utils';
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
  const { issues, isLoading: issuesLoading, fetchIssues } = useIssuesStore();
  const { publicStats, isLoading: statsLoading, fetchPublicStats } = useDashboardStore();
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    fetchStats();
    if (isAuthenticated) {
      fetchRecentIssues();
    }
  }, [isAuthenticated]);

  const fetchRecentIssues = async () => {
    try {
      await fetchIssues({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' });
    } catch (error) {
      console.error('Error loading recent issues:', error);
    }
  };

  // Update recent issues when store issues change
  useEffect(() => {
    if (issues && issues.length > 0) {
      // Get the 3 most recent issues from the store
      const recent = issues
        .slice(0, 3)
        .map(issue => ({
          id: issue.id,
          title: issue.title,
          status: issue.status,
          category: issue.category_name || 'General',
          location: issue.address || `${issue.location_lat}, ${issue.location_lng}`,
          timeAgo: formatRelativeTime(issue.created_at)
        }));
      setRecentIssues(recent);
    }
  }, [issues]);

  const fetchStats = async () => {
    const result = await fetchPublicStats();
    
    if (result.success) {
      const statsData = result.stats;
      // Calculate response rate as percentage of resolved issues out of total issues
      const totalIssues = statsData.total_issues || 0;
      const resolvedIssues = statsData.resolved_issues || 0;
      const responseRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

      setStats([
        { 
          label: 'Issues Reported', 
          value: totalIssues.toLocaleString(), 
          icon: AlertTriangle, 
          color: 'text-blue-600' 
        },
        { 
          label: 'Issues Resolved', 
          value: resolvedIssues.toLocaleString(), 
          icon: CheckCircle, 
          color: 'text-green-600' 
        },
        { 
          label: 'Active Citizens', 
          value: statsData.total_citizens?.toLocaleString() || '0', 
          icon: Users, 
          color: 'text-purple-600' 
        },
        { 
          label: 'Response Rate', 
          value: `${responseRate}%`, 
          icon: TrendingUp, 
          color: 'text-orange-600' 
        },
      ]);
    } else {
      // Fallback to default stats
      setStats([
        { label: 'Issues Reported', value: 'N/A', icon: AlertTriangle, color: 'text-blue-600' },
        { label: 'Issues Resolved', value: 'N/A', icon: CheckCircle, color: 'text-green-600' },
        { label: 'Active Citizens', value: 'N/A', icon: Users, color: 'text-purple-600' },
        { label: 'Response Rate', value: 'N/A', icon: TrendingUp, color: 'text-orange-600' },
      ]);
    }
  };

  const staticStats = [
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'ACKNOWLEDGED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      {/* Hero Section */}
      <section className="text-white" style={{ background: colors.gradients.primary }}>
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
                    variant="primary"
                    className="px-8 py-4 text-lg font-medium"
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
                      variant="primary"
                      className="px-8 py-4 text-lg font-medium"
                    >
                      Get Started
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-medium transition-all duration-200 backdrop-blur-sm bg-white/10"
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
          {statsLoading ? (
            <div className="text-center">
              <LoadingCard message="Loading community statistics..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {(stats || staticStats).map((stat, index) => {
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
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A2A80] mb-4">
              How Naagrik Works
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
                        className="w-full"
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

            {issuesLoading ? (
              <div className="text-center">
                <LoadingCard message="Loading recent issues..." />
              </div>
            ) : recentIssues.length > 0 ? (
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
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recent Issues</h3>
                <p className="text-gray-500 mb-4">Be the first to report an issue in your community!</p>
                <Link href="/report/add">
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </Link>
              </div>
            )}
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
                variant="primary"
                className="px-8 py-4 text-lg font-medium"
              >
                <Plus className="h-6 w-6 mr-2" />
                Report Your First Issue
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="lg"
                variant="primary"
                className="px-8 py-4 text-lg font-medium"
              >
                Join Naagrik Today
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
